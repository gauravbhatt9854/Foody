const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get orders (filtered by user role)
 * @access  Private
 */
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  query('orderType').optional().isIn(['pickup', 'delivery']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      orderType,
      startDate,
      endDate
    } = req.query;

    // Build filter object based on user role
    const filter = {};
    
    if (req.user.role === 'student') {
      filter.customer = req.user._id;
    }
    
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .populate('customer', 'name email studentId')
      .populate('items.menuItem', 'name price image')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email studentId phone')
      .populate('items.menuItem', 'name price image description')
      .populate('assignedTo', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order
    if (req.user.role === 'student' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (Students)
 */
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItem').isMongoId().withMessage('Valid menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.specialInstructions').optional().trim(),
  body('orderType').isIn(['pickup', 'delivery']).withMessage('Order type must be pickup or delivery'),
  body('deliveryAddress').optional().trim(),
  body('specialInstructions').optional().trim(),
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'wallet']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, orderType, deliveryAddress, specialInstructions, paymentMethod } = req.body;

    // Validate delivery address for delivery orders
    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required for delivery orders' });
    }

    // Fetch menu items and validate availability
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ 
      _id: { $in: menuItemIds },
      isAvailable: true 
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: 'Some menu items are not available or invalid' });
    }

    // Calculate total amount and prepare order items
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItem);
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      return {
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      };
    });

    // Create order
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      orderType,
      deliveryAddress,
      specialInstructions,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email studentId')
      .populate('items.menuItem', 'name price image');

    // Emit order to staff room for real-time notifications
    const io = req.app.get('io');
    io.to('staff-room').emit('new-order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: populatedOrder.customer.name,
      totalAmount: order.totalAmount,
      orderType: order.orderType
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Staff/Admin)
 */
router.put('/:id/status', authenticateToken, requireStaff, [
  body('status').isIn(['confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('staffNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, staffNotes } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}` 
      });
    }

    // Update order
    order.status = status;
    if (staffNotes) order.staffNotes = staffNotes;
    if (!order.assignedTo) order.assignedTo = req.user._id;

    // Set delivery time for delivered orders
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Emit status update to customer
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('order-status-updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Update payment status (Mock payment)
 * @access  Private
 */
router.post('/:id/payment', authenticateToken, [
  body('paymentStatus').isIn(['completed', 'failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can update this order's payment
    if (req.user.role === 'student' && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mock payment processing
    setTimeout(async () => {
      order.paymentStatus = paymentStatus;
      
      // If payment is successful and order is pending, auto-confirm
      if (paymentStatus === 'completed' && order.status === 'pending') {
        order.status = 'confirmed';
      }

      await order.save();

      // Emit payment update
      const io = req.app.get('io');
      io.to(`order-${order._id}`).emit('payment-updated', {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status
      });

      if (paymentStatus === 'completed') {
        io.to('staff-room').emit('payment-received', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount
        });
      }
    }, 2000); // Simulate 2-second payment processing

    res.json({
      message: 'Payment processing initiated',
      paymentStatus: 'processing'
    });
  } catch (error) {
    console.error('Process payment error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error while processing payment' });
  }
});

/**
 * @route   POST /api/orders/:id/review
 * @desc    Add review and rating to completed order
 * @access  Private (Customer only)
 */
router.post('/:id/review', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the customer
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check if already reviewed
    if (order.rating) {
      return res.status(400).json({ message: 'Order already reviewed' });
    }

    order.rating = rating;
    if (review) order.review = review;
    await order.save();

    res.json({
      message: 'Review added successfully',
      order
    });
  } catch (error) {
    console.error('Add review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error while adding review' });
  }
});

/**
 * @route   GET /api/orders/stats/summary
 * @desc    Get order statistics summary
 * @access  Private (Staff/Admin)
 */
router.get('/stats/summary', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Order.aggregate([
      {
        $facet: {
          today: [
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
          ],
          total: [
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          pending: [
            { $match: { status: { $in: ['pending', 'confirmed', 'preparing'] } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const summary = {
      todayOrders: stats[0].today[0]?.count || 0,
      todayRevenue: stats[0].today[0]?.revenue || 0,
      totalOrders: stats[0].total[0]?.count || 0,
      totalRevenue: stats[0].total[0]?.revenue || 0,
      pendingOrders: stats[0].pending[0]?.count || 0,
      statusBreakdown: stats[0].byStatus
    };

    res.json({ stats: summary });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error while fetching order statistics' });
  }
});

module.exports = router;