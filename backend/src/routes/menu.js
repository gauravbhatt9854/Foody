const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/menu
 * @desc    Get all menu items with filtering and pagination
 * @access  Public
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts']),
  query('available').optional().isBoolean(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'price', 'rating', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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
      category,
      available,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const menuItems = await MenuItem.find(filter)
      .populate('createdBy', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await MenuItem.countDocuments(filter);

    res.json({
      menuItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
});

/**
 * @route   GET /api/menu/categories
 * @desc    Get all available categories with item counts
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          availableCount: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

/**
 * @route   GET /api/menu/:id
 * @desc    Get single menu item by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ menuItem });
  } catch (error) {
    console.error('Get menu item error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    res.status(500).json({ message: 'Server error while fetching menu item' });
  }
});

/**
 * @route   POST /api/menu
 * @desc    Create new menu item
 * @access  Private (Staff/Admin)
 */
router.post('/', authenticateToken, requireStaff, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts']).withMessage('Invalid category'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('isVegetarian').optional().isBoolean(),
  body('isVegan').optional().isBoolean(),
  body('isGlutenFree').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const menuItemData = {
      ...req.body,
      createdBy: req.user._id
    };

    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    const populatedMenuItem = await MenuItem.findById(menuItem._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: populatedMenuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Server error while creating menu item' });
  }
});

/**
 * @route   PUT /api/menu/:id
 * @desc    Update menu item
 * @access  Private (Staff/Admin)
 */
router.put('/:id', authenticateToken, requireStaff, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts']).withMessage('Invalid category'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('isVegetarian').optional().isBoolean(),
  body('isVegan').optional().isBoolean(),
  body('isGlutenFree').optional().isBoolean(),
  body('isAvailable').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        menuItem[key] = req.body[key];
      }
    });

    await menuItem.save();

    const updatedMenuItem = await MenuItem.findById(menuItem._id)
      .populate('createdBy', 'name');

    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    res.status(500).json({ message: 'Server error while updating menu item' });
  }
});

/**
 * @route   DELETE /api/menu/:id
 * @desc    Delete menu item
 * @access  Private (Staff/Admin)
 */
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    res.status(500).json({ message: 'Server error while deleting menu item' });
  }
});

/**
 * @route   POST /api/menu/:id/toggle-availability
 * @desc    Toggle menu item availability
 * @access  Private (Staff/Admin)
 */
router.post('/:id/toggle-availability', authenticateToken, requireStaff, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      menuItem
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    res.status(500).json({ message: 'Server error while toggling availability' });
  }
});

module.exports = router;