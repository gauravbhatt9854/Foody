# 🍕 Foody - Enhanced College Cafeteria Food Delivery App

## 🚀 Overview

Foody has been completely enhanced with a modern, Zomato-like design and user experience. The app now features a vibrant color scheme, improved UI components, and enhanced functionality for a seamless food ordering experience.

## ✨ New Features & Enhancements

### 🎨 UI/UX Improvements
- **Zomato-inspired Design**: Modern, clean interface with vibrant red (#dc2626) color scheme
- **Enhanced Typography**: Inter font family for better readability
- **Card-based Layout**: Beautiful food item cards with hover effects and animations
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Smooth Animations**: Hover effects, transitions, and micro-interactions

### 🍽️ Enhanced Components

#### 1. **Layout Component** (`/src/components/Layout.js`)
- **Modern Header**: Zomato-style navigation with search bar
- **Mobile-First Design**: Responsive sidebar and bottom navigation for mobile
- **Cart Badge**: Real-time cart item count indicator
- **User Profile**: Quick access to user info and logout

#### 2. **HomePage** (`/src/pages/HomePage.js`)
- **Hero Section**: Eye-catching gradient background with search functionality
- **Category Cards**: Visual category selection with icons and counts
- **Featured Items**: Today's special items with ratings and quick add functionality
- **Statistics**: Customer count, ratings, and delivery stats
- **Quick Actions**: Role-based action cards

#### 3. **MenuPage** (`/src/pages/MenuPage.js`)
- **Advanced Search**: Debounced search with filters
- **Category Filtering**: Easy category selection tabs
- **Sorting Options**: Sort by popularity, rating, price, etc.
- **Top Picks Section**: Showcases most popular items
- **Food Cards**: Enhanced with ratings, badges, and quick actions

#### 4. **FoodCard Component** (`/src/components/FoodCard.js`)
- **Visual Appeal**: High-quality image placeholders with loading states
- **Rating System**: Star ratings with review counts
- **Dietary Badges**: Vegetarian, vegan, gluten-free, spicy indicators
- **Popularity Badges**: Bestseller and popular item indicators
- **Quick Add**: Hover-to-reveal add buttons
- **Quantity Controls**: In-card quantity adjustment

#### 5. **CartPage** (`/src/pages/CartPage.js`)
- **Enhanced Layout**: Two-column layout with sticky order summary
- **Bill Breakdown**: Detailed pricing with taxes and delivery fees
- **Promo Codes**: Apply discount codes functionality
- **Payment Options**: Card and cash on delivery options
- **Delivery Info**: Estimated delivery time and address management

#### 6. **OrdersPage** (`/src/pages/OrdersPage.js`)
- **Filter Tabs**: Filter orders by status (All, Active, Delivered, Cancelled)
- **Order Cards**: Detailed order information with item previews
- **Real-time Updates**: Live order status updates
- **Order Tracking**: Integrated tracking system

#### 7. **OrderTracking Component** (`/src/components/OrderTracking.js`)
- **Progress Bar**: Visual order progress from placed to delivered
- **Status Icons**: Clear icons for each order stage
- **Time Stamps**: Real-time updates with timestamps
- **Estimated Delivery**: Dynamic delivery time calculation

#### 8. **Recommendations Component** (`/src/components/Recommendations.js`)
- **Smart Suggestions**: "You may also like" based on categories
- **Top Picks**: Most ordered items with ranking
- **Dynamic Loading**: Skeleton loading states

### 🛠️ Technical Enhancements

#### **TailwindCSS Configuration**
- **Custom Color Palette**: Zomato-inspired red primary colors
- **Typography**: Inter font family integration
- **Animations**: Custom keyframes for smooth transitions
- **Responsive Breakpoints**: Mobile-first approach
- **Custom Shadows**: Card and hover effects

## 🚀 Features

- **User Authentication**: Register, login, and secure user sessions
- **Admin Dashboard**: User management and analytics
- **Real-time Updates**: Socket.IO integration for live updates
- **Responsive Design**: Mobile-friendly interface
- **Food Ordering**: Browse menu and place orders
- **Database Integration**: MongoDB Atlas for data storage

## 🛠️ Tech Stack

**Frontend:**
- React.js 18
- CSS3 for styling
- Responsive design

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- Socket.IO
- JWT Authentication

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- Git

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/foody.git
cd foody
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Update the `.env` file with your actual values:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

### Start Frontend Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
foody/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   ├── .env.example     # Environment variables template
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main App component
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token generation |
| `NODE_ENV` | Environment (development/production) |
| `FRONTEND_URL` | Frontend URL for CORS |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Rounak Mishra](https://github.com/rounakmishra06)

## 🐛 Known Issues

- Make sure to URL encode special characters in your MongoDB password
- Ensure both frontend and backend servers are running for full functionality

## 📞 Support

If you have any questions or need help, please open an issue in this repository.

---

**Happy Coding! 🚀**
