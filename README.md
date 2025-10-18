# 🍕 Foody - Food Delivery Application

A full-stack food delivery application built with React.js frontend and Node.js/Express backend, connected to MongoDB Atlas.

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
