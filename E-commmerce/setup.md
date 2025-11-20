# Craftify Setup Guide

## Prerequisites

Before setting up Craftify, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```bash
cd ../backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/craftify

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

If using local MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

If using MongoDB Atlas, make sure to update the `MONGODB_URI` in your `.env` file.

### 5. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Structure

```
craftify/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Main server file
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── styles/         # Global styles
│   │   └── App.js          # Main app component
│   └── package.json
└── README.md
```

## Features Implemented

### ✅ Completed
- [x] Project structure setup
- [x] MongoDB database schemas
- [x] User authentication system
- [x] Basic API routes
- [x] React frontend with routing
- [x] Responsive design with styled-components
- [x] Context-based state management
- [x] Beautiful home page
- [x] User registration and login

### 🚧 In Progress
- [ ] Product catalog and search
- [ ] Shopping cart functionality
- [ ] Payment integration
- [ ] Seller dashboard
- [ ] Admin panel
- [ ] Review system
- [ ] Image upload
- [ ] Order management

## Next Steps

1. **Test the basic setup** by registering a new user
2. **Add sample data** to test the product catalog
3. **Implement product management** for sellers
4. **Add payment processing** with Stripe
5. **Deploy to production** when ready

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check the connection string in `.env`
- Verify network connectivity for MongoDB Atlas

**Port Already in Use:**
- Change the PORT in `.env` file
- Kill existing processes using the port

**Module Not Found:**
- Run `npm install` in both backend and frontend directories
- Clear node_modules and reinstall if needed

**CORS Errors:**
- Verify FRONTEND_URL in backend `.env`
- Check that both servers are running

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check that both backend and frontend servers are running

Happy coding! 🎨✨
