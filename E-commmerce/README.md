# Craftify - Online Marketplace for Handmade & Artisanal Products

A modern, full-stack e-commerce platform specifically designed for artisans and crafters to showcase and sell their handmade products.

## 🎨 Features

### For Buyers
- Browse handmade products by category
- Advanced search and filtering
- Product reviews and ratings
- Secure shopping cart and checkout
- Order tracking and history
- Wishlist functionality

### For Sellers
- Seller dashboard for product management
- Order management and tracking
- Sales analytics and insights
- Profile customization
- Inventory management

### For Admins
- User and seller management
- Product moderation
- Order oversight
- Platform analytics
- Content management

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Styled Components** - CSS-in-JS styling
- **React Hook Form** - Form management
- **React Query** - Server state management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
craftify/
├── frontend/          # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd craftify
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# In backend directory, create .env file
cp .env.example .env
# Configure your MongoDB connection and other settings
```

> **Note**: By default, the application connects to a local MongoDB instance. To use MongoDB Atlas instead, update the `MONGODB_URI` in your `.env` file with your Atlas connection string. See `MONGODB_ATLAS_SETUP.md` for detailed instructions.

5. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🌟 Key Features to Implement

- [ ] User authentication and authorization
- [ ] Product catalog with categories
- [ ] Shopping cart and checkout
- [ ] Payment integration
- [ ] Order management
- [ ] Review and rating system
- [ ] Seller dashboard
- [ ] Admin panel
- [ ] Search and filtering
- [ ] Responsive design
- [ ] Image upload and optimization
- [ ] Email notifications

## 📝 License

This project is licensed under the MIT License.
