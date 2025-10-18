const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0001',
    address: 'College Administration Building'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.staff@college.edu',
    password: 'staff123',
    role: 'staff',
    phone: '+1-555-0002',
    address: 'Cafeteria Building'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.staff@college.edu',
    password: 'staff123',
    role: 'staff',
    phone: '+1-555-0003',
    address: 'Cafeteria Building'
  },
  {
    name: 'John Smith',
    email: 'john.student@college.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU001',
    phone: '+1-555-1001',
    address: 'Dormitory A, Room 201'
  },
  {
    name: 'Emily Davis',
    email: 'emily.student@college.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU002',
    phone: '+1-555-1002',
    address: 'Dormitory B, Room 305'
  },
  {
    name: 'Alex Chen',
    email: 'alex.student@college.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU003',
    phone: '+1-555-1003',
    address: 'Dormitory C, Room 102'
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria.student@college.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU004',
    phone: '+1-555-1004',
    address: 'Off-campus Housing'
  },
  {
    name: 'David Brown',
    email: 'david.student@college.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU005',
    phone: '+1-555-1005',
    address: 'Dormitory A, Room 150'
  }
];

const sampleMenuItems = [
  // Breakfast
  {
    name: 'Classic Pancakes',
    description: 'Fluffy pancakes served with maple syrup and butter',
    price: 8.99,
    category: 'breakfast',
    image: '/uploads/pancakes.jpg',
    ingredients: ['flour', 'eggs', 'milk', 'butter', 'maple syrup'],
    nutritionalInfo: { calories: 450, protein: 12, carbs: 65, fat: 15 },
    isVegetarian: true,
    preparationTime: 10,
    rating: 4.5,
    reviewCount: 23
  },
  {
    name: 'Avocado Toast',
    description: 'Fresh avocado on whole grain toast with cherry tomatoes',
    price: 6.99,
    category: 'breakfast',
    image: '/uploads/avocado-toast.jpg',
    ingredients: ['avocado', 'whole grain bread', 'cherry tomatoes', 'olive oil', 'salt'],
    nutritionalInfo: { calories: 320, protein: 8, carbs: 35, fat: 18 },
    isVegetarian: true,
    isVegan: true,
    preparationTime: 5,
    rating: 4.3,
    reviewCount: 18
  },
  {
    name: 'Breakfast Burrito',
    description: 'Scrambled eggs, cheese, peppers, and sausage in a flour tortilla',
    price: 9.99,
    category: 'breakfast',
    image: '/uploads/breakfast-burrito.jpg',
    ingredients: ['eggs', 'cheese', 'bell peppers', 'sausage', 'flour tortilla'],
    nutritionalInfo: { calories: 520, protein: 25, carbs: 42, fat: 28 },
    preparationTime: 12,
    rating: 4.7,
    reviewCount: 31
  },

  // Lunch
  {
    name: 'Grilled Chicken Sandwich',
    description: 'Grilled chicken breast with lettuce, tomato, and mayo on a brioche bun',
    price: 12.99,
    category: 'lunch',
    image: '/uploads/chicken-sandwich.jpg',
    ingredients: ['chicken breast', 'brioche bun', 'lettuce', 'tomato', 'mayonnaise'],
    nutritionalInfo: { calories: 580, protein: 35, carbs: 45, fat: 25 },
    preparationTime: 15,
    rating: 4.4,
    reviewCount: 42
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 10.99,
    category: 'lunch',
    image: '/uploads/caesar-salad.jpg',
    ingredients: ['romaine lettuce', 'caesar dressing', 'croutons', 'parmesan cheese'],
    nutritionalInfo: { calories: 350, protein: 12, carbs: 25, fat: 22 },
    isVegetarian: true,
    preparationTime: 8,
    rating: 4.2,
    reviewCount: 28
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and pickles',
    price: 14.99,
    category: 'lunch',
    image: '/uploads/beef-burger.jpg',
    ingredients: ['beef patty', 'cheese', 'lettuce', 'tomato', 'pickles', 'burger bun'],
    nutritionalInfo: { calories: 680, protein: 32, carbs: 48, fat: 38 },
    preparationTime: 18,
    rating: 4.6,
    reviewCount: 56
  },
  {
    name: 'Veggie Wrap',
    description: 'Fresh vegetables and hummus wrapped in a spinach tortilla',
    price: 8.99,
    category: 'lunch',
    image: '/uploads/veggie-wrap.jpg',
    ingredients: ['spinach tortilla', 'hummus', 'cucumber', 'tomato', 'bell peppers', 'sprouts'],
    nutritionalInfo: { calories: 380, protein: 14, carbs: 52, fat: 12 },
    isVegetarian: true,
    isVegan: true,
    preparationTime: 10,
    rating: 4.1,
    reviewCount: 19
  },

  // Dinner
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon herb seasoning and steamed vegetables',
    price: 18.99,
    category: 'dinner',
    image: '/uploads/grilled-salmon.jpg',
    ingredients: ['atlantic salmon', 'lemon', 'herbs', 'broccoli', 'carrots'],
    nutritionalInfo: { calories: 420, protein: 38, carbs: 15, fat: 22 },
    isGlutenFree: true,
    preparationTime: 20,
    rating: 4.8,
    reviewCount: 34
  },
  {
    name: 'Chicken Alfredo Pasta',
    description: 'Creamy alfredo sauce over fettuccine with grilled chicken',
    price: 15.99,
    category: 'dinner',
    image: '/uploads/chicken-alfredo.jpg',
    ingredients: ['fettuccine', 'chicken breast', 'alfredo sauce', 'parmesan', 'garlic'],
    nutritionalInfo: { calories: 720, protein: 42, carbs: 68, fat: 32 },
    preparationTime: 22,
    rating: 4.5,
    reviewCount: 47
  },
  {
    name: 'Vegetable Stir Fry',
    description: 'Mixed vegetables stir-fried with teriyaki sauce over jasmine rice',
    price: 11.99,
    category: 'dinner',
    image: '/uploads/veggie-stirfry.jpg',
    ingredients: ['mixed vegetables', 'teriyaki sauce', 'jasmine rice', 'sesame oil'],
    nutritionalInfo: { calories: 420, protein: 12, carbs: 75, fat: 8 },
    isVegetarian: true,
    isVegan: true,
    preparationTime: 15,
    rating: 4.3,
    reviewCount: 25
  },

  // Snacks
  {
    name: 'Loaded Nachos',
    description: 'Tortilla chips topped with cheese, jalapeños, and sour cream',
    price: 7.99,
    category: 'snacks',
    image: '/uploads/loaded-nachos.jpg',
    ingredients: ['tortilla chips', 'cheese sauce', 'jalapeños', 'sour cream', 'green onions'],
    nutritionalInfo: { calories: 540, protein: 18, carbs: 45, fat: 32 },
    isVegetarian: true,
    preparationTime: 8,
    rating: 4.4,
    reviewCount: 22
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy chicken wings with choice of buffalo or BBQ sauce',
    price: 9.99,
    category: 'snacks',
    image: '/uploads/chicken-wings.jpg',
    ingredients: ['chicken wings', 'buffalo sauce', 'celery', 'blue cheese dressing'],
    nutritionalInfo: { calories: 480, protein: 28, carbs: 8, fat: 36 },
    preparationTime: 12,
    rating: 4.6,
    reviewCount: 38
  },
  {
    name: 'Mozzarella Sticks',
    description: 'Breaded mozzarella sticks served with marinara sauce',
    price: 6.99,
    category: 'snacks',
    image: '/uploads/mozzarella-sticks.jpg',
    ingredients: ['mozzarella cheese', 'breadcrumbs', 'marinara sauce'],
    nutritionalInfo: { calories: 390, protein: 22, carbs: 28, fat: 22 },
    isVegetarian: true,
    preparationTime: 10,
    rating: 4.2,
    reviewCount: 15
  },

  // Beverages
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 3.99,
    category: 'beverages',
    image: '/uploads/orange-juice.jpg',
    ingredients: ['fresh oranges'],
    nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0 },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 3,
    rating: 4.1,
    reviewCount: 12
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice with optional milk and sweetener',
    price: 2.99,
    category: 'beverages',
    image: '/uploads/iced-coffee.jpg',
    ingredients: ['coffee beans', 'ice', 'milk', 'sugar'],
    nutritionalInfo: { calories: 50, protein: 1, carbs: 8, fat: 2 },
    isVegetarian: true,
    preparationTime: 2,
    rating: 4.3,
    reviewCount: 29
  },
  {
    name: 'Green Smoothie',
    description: 'Spinach, banana, mango, and coconut water smoothie',
    price: 5.99,
    category: 'beverages',
    image: '/uploads/green-smoothie.jpg',
    ingredients: ['spinach', 'banana', 'mango', 'coconut water'],
    nutritionalInfo: { calories: 180, protein: 4, carbs: 42, fat: 1 },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 5,
    rating: 3.9,
    reviewCount: 16
  },

  // Desserts
  {
    name: 'Chocolate Chip Cookies',
    description: 'Warm chocolate chip cookies (3 pieces)',
    price: 4.99,
    category: 'desserts',
    image: '/uploads/chocolate-cookies.jpg',
    ingredients: ['flour', 'chocolate chips', 'butter', 'sugar', 'eggs'],
    nutritionalInfo: { calories: 320, protein: 4, carbs: 45, fat: 14 },
    isVegetarian: true,
    preparationTime: 15,
    rating: 4.7,
    reviewCount: 41
  },
  {
    name: 'Cheesecake Slice',
    description: 'Classic New York style cheesecake with berry compote',
    price: 6.99,
    category: 'desserts',
    image: '/uploads/cheesecake.jpg',
    ingredients: ['cream cheese', 'graham crackers', 'berries', 'sugar'],
    nutritionalInfo: { calories: 420, protein: 8, carbs: 35, fat: 28 },
    isVegetarian: true,
    preparationTime: 5,
    rating: 4.8,
    reviewCount: 33
  },
  {
    name: 'Ice Cream Sundae',
    description: 'Vanilla ice cream with chocolate sauce, whipped cream, and cherry',
    price: 5.99,
    category: 'desserts',
    image: '/uploads/ice-cream-sundae.jpg',
    ingredients: ['vanilla ice cream', 'chocolate sauce', 'whipped cream', 'cherry'],
    nutritionalInfo: { calories: 380, protein: 6, carbs: 48, fat: 18 },
    isVegetarian: true,
    preparationTime: 3,
    rating: 4.4,
    reviewCount: 27
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foody', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      users.push({
        ...userData,
        password: hashedPassword
      });
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed menu items
const seedMenuItems = async (users) => {
  try {
    // Find staff user to assign as creator
    const staffUser = users.find(user => user.role === 'staff');
    
    const menuItems = sampleMenuItems.map(item => ({
      ...item,
      createdBy: staffUser._id
    }));
    
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Created ${createdMenuItems.length} menu items`);
    return createdMenuItems;
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
};

// Seed sample orders
const seedOrders = async (users, menuItems) => {
  try {
    const students = users.filter(user => user.role === 'student');
    const orders = [];
    
    // Create some sample orders
    for (let i = 0; i < 10; i++) {
      const customer = students[Math.floor(Math.random() * students.length)];
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        
        orderItems.push({
          menuItem: menuItem._id,
          quantity,
          price: menuItem.price,
          specialInstructions: Math.random() > 0.7 ? 'Extra sauce' : undefined
        });
        
        totalAmount += menuItem.price * quantity;
      }
      
      const statuses = ['delivered', 'preparing', 'ready', 'confirmed'];
      const orderTypes = ['pickup', 'delivery'];
      const paymentMethods = ['cash', 'card', 'upi'];
      
      const order = {
        customer: customer._id,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        paymentStatus: Math.random() > 0.2 ? 'completed' : 'pending',
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        deliveryAddress: Math.random() > 0.5 ? customer.address : undefined,
        specialInstructions: Math.random() > 0.6 ? 'Please call when ready' : undefined,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date within last week
      };
      
      // Add delivery time for delivered orders
      if (order.status === 'delivered') {
        order.actualDeliveryTime = new Date(order.createdAt.getTime() + (20 + Math.random() * 40) * 60000); // 20-60 minutes later
      }
      
      orders.push(order);
    }
    
    const createdOrders = await Order.insertMany(orders);
    console.log(`📦 Created ${createdOrders.length} sample orders`);
    return createdOrders;
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    await clearData();
    
    const users = await seedUsers();
    const menuItems = await seedMenuItems(users);
    const orders = await seedOrders(users, menuItems);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('┌─────────────────────────────────────┐');
    console.log('│ Admin:                              │');
    console.log('│ Email: admin@college.edu            │');
    console.log('│ Password: admin123                  │');
    console.log('├─────────────────────────────────────┤');
    console.log('│ Staff:                              │');
    console.log('│ Email: sarah.staff@college.edu      │');
    console.log('│ Password: staff123                  │');
    console.log('├─────────────────────────────────────┤');
    console.log('│ Student:                            │');
    console.log('│ Email: john.student@college.edu     │');
    console.log('│ Password: student123                │');
    console.log('└─────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };