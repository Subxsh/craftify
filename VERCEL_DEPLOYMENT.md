# Vercel Deployment Guide

## Environment Variables Required:

### Production Environment Variables
- NODE_ENV=production
- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_secure_jwt_secret
- FRONTEND_URL=https://your-vercel-app.vercel.app
- REACT_APP_API_URL=https://your-vercel-app.vercel.app/api

## Build Commands:
- Frontend Build: cd E-commmerce/frontend && npm install && npm run build
- Backend Build: cd E-commmerce/backend && npm install

## Notes:
- Backend runs as serverless functions on Vercel
- Frontend is served as static files
- MongoDB Atlas required for database