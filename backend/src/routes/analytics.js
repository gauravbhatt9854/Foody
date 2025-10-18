const express = require('express');
const { query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics
 * @access  Private (Admin)
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const analytics = await Promise.all([
      // Today's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { 
          $group: { 
            _id: null, 
            count: { $sum: 1 }, 
            revenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          } 
        }
      ]),

      // Yesterday's stats for comparison
      Order.aggregate([
        { $match: { createdAt: { $gte: yesterday, $lt: today } } },
        { 
          $group: { 
            _id: null, 
            count: { $sum: 1 }, 
            revenue: { $sum: '$totalAmount' }
          } 
        }
      ]),

      // This week's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: lastWeek } } },
        { 
          $group: { 
            _id: null, 
            count: { $sum: 1 }, 
            revenue: { $sum: '$totalAmount' }
          } 
        }
      ]),

      // Order status breakdown
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Popular menu items (last 30 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth } } },
        { $unwind: '$items' },
        { 
          $group: { 
            _id: '$items.menuItem',
            totalOrders: { $sum: 1 },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        { 
          $lookup: {
            from: 'menuitems',
            localField: '_id',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' }
      ]),

      // User registrations trend (last 7 days)
      User.aggregate([
        { $match: { createdAt: { $gte: lastWeek } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue trend (last 7 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: lastWeek }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const [
      todayStats,
      yesterdayStats,
      weekStats,
      statusBreakdown,
      popularItems,
      userTrend,
      revenueTrend
    ] = analytics;

    const dashboard = {
      today: {
        orders: todayStats[0]?.count || 0,
        revenue: todayStats[0]?.revenue || 0,
        avgOrderValue: todayStats[0]?.avgOrderValue || 0
      },
      yesterday: {
        orders: yesterdayStats[0]?.count || 0,
        revenue: yesterdayStats[0]?.revenue || 0
      },
      week: {
        orders: weekStats[0]?.count || 0,
        revenue: weekStats[0]?.revenue || 0
      },
      ordersByStatus: statusBreakdown,
      popularMenuItems: popularItems,
      userRegistrationTrend: userTrend,
      revenueTrend: revenueTrend,
      growthRates: {
        ordersGrowth: yesterdayStats[0]?.count ? 
          ((todayStats[0]?.count || 0) - yesterdayStats[0].count) / yesterdayStats[0].count * 100 : 0,
        revenueGrowth: yesterdayStats[0]?.revenue ? 
          ((todayStats[0]?.revenue || 0) - yesterdayStats[0].revenue) / yesterdayStats[0].revenue * 100 : 0
      }
    };

    res.json({ analytics: dashboard });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue analytics with date range
 * @access  Private (Admin)
 */
router.get('/revenue', authenticateToken, requireAdmin, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Invalid groupBy value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupFormat = '%Y-%U';
        break;
      case 'month':
        groupFormat = '%Y-%m';
        break;
    }

    const revenueData = await Order.aggregate([
      { 
        $match: { 
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          status: { $ne: 'cancelled' }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ revenueAnalytics: revenueData });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching revenue analytics' });
  }
});

/**
 * @route   GET /api/analytics/menu-performance
 * @desc    Get menu item performance analytics
 * @access  Private (Admin)
 */
router.get('/menu-performance', authenticateToken, requireAdmin, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const { startDate, endDate, limit = 20 } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const menuPerformance = await Order.aggregate([
      { 
        $match: { 
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          status: { $ne: 'cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          menuItem: {
            _id: '$menuItem._id',
            name: '$menuItem.name',
            category: '$menuItem.category',
            price: '$menuItem.price',
            image: '$menuItem.image'
          },
          totalOrders: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          avgPrice: 1,
          performance: {
            $divide: ['$totalRevenue', { $ifNull: ['$totalOrders', 1] }]
          }
        }
      }
    ]);

    res.json({ menuPerformance });
  } catch (error) {
    console.error('Get menu performance error:', error);
    res.status(500).json({ message: 'Server error while fetching menu performance' });
  }
});

/**
 * @route   GET /api/analytics/customer-insights
 * @desc    Get customer behavior insights
 * @access  Private (Admin)
 */
router.get('/customer-insights', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const insights = await Promise.all([
      // Top customers by order count
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$customer',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' }
      ]),

      // Order type distribution
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$orderType',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),

      // Peak ordering hours
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Average delivery time by order type
      Order.aggregate([
        { 
          $match: { 
            status: 'delivered',
            actualDeliveryTime: { $exists: true }
          } 
        },
        {
          $group: {
            _id: '$orderType',
            avgDeliveryTime: {
              $avg: {
                $divide: [
                  { $subtract: ['$actualDeliveryTime', '$createdAt'] },
                  60000 // Convert to minutes
                ]
              }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const [topCustomers, orderTypeDistribution, peakHours, avgDeliveryTimes] = insights;

    res.json({
      customerInsights: {
        topCustomers,
        orderTypeDistribution,
        peakOrderingHours: peakHours,
        averageDeliveryTimes: avgDeliveryTimes
      }
    });
  } catch (error) {
    console.error('Get customer insights error:', error);
    res.status(500).json({ message: 'Server error while fetching customer insights' });
  }
});

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data as CSV
 * @access  Private (Admin)
 */
router.get('/export', authenticateToken, requireAdmin, [
  query('type').isIn(['orders', 'revenue', 'menu-performance']).withMessage('Invalid export type'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const { type, startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let data;
    let headers;

    switch (type) {
      case 'orders':
        data = await Order.find({
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
        .populate('customer', 'name email studentId')
        .populate('items.menuItem', 'name category')
        .sort({ createdAt: -1 });
        
        headers = ['Order Number', 'Customer', 'Email', 'Total Amount', 'Status', 'Order Type', 'Created At'];
        break;

      case 'revenue':
        data = await Order.aggregate([
          { 
            $match: { 
              ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
              status: { $ne: 'cancelled' }
            } 
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        
        headers = ['Date', 'Revenue', 'Orders'];
        break;

      case 'menu-performance':
        data = await Order.aggregate([
          { 
            $match: { 
              ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
              status: { $ne: 'cancelled' }
            } 
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.menuItem',
              totalQuantity: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          {
            $lookup: {
              from: 'menuitems',
              localField: '_id',
              foreignField: '_id',
              as: 'menuItem'
            }
          },
          { $unwind: '$menuItem' },
          { $sort: { totalRevenue: -1 } }
        ]);
        
        headers = ['Menu Item', 'Category', 'Total Quantity', 'Total Revenue'];
        break;
    }

    // Convert to CSV format (simplified - in production, use a proper CSV library)
    const csvData = [headers.join(',')];
    
    if (type === 'orders') {
      data.forEach(order => {
        csvData.push([
          order.orderNumber,
          order.customer?.name || 'N/A',
          order.customer?.email || 'N/A',
          order.totalAmount,
          order.status,
          order.orderType,
          order.createdAt.toISOString()
        ].join(','));
      });
    } else if (type === 'revenue') {
      data.forEach(row => {
        csvData.push([row._id, row.revenue, row.orders].join(','));
      });
    } else if (type === 'menu-performance') {
      data.forEach(item => {
        csvData.push([
          item.menuItem.name,
          item.menuItem.category,
          item.totalQuantity,
          item.totalRevenue
        ].join(','));
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvData.join('\n'));

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Server error while exporting analytics' });
  }
});

module.exports = router;