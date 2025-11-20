# Railway Deployment Guide for Craftify

## Backend Service Configuration:
Start Command: cd E-commmerce/backend && npm start
Environment Variables:
- NODE_ENV=production
- MONGODB_URI=your_mongodb_atlas_connection_string
- JWT_SECRET=your_secure_random_32_char_secret
- JWT_EXPIRE=7d
- PORT=5000

## Frontend Service Configuration:
Install Command: cd E-commmerce/frontend && npm install
Build Command: cd E-commmerce/frontend && npm run build
Start Command: cd E-commmerce/frontend && npx serve -s build -p $PORT
Environment Variables:
- REACT_APP_API_URL=https://your-backend-service.railway.app/api

## Steps:
1. Create two separate Railway projects from the same GitHub repo
2. Configure backend first, get the URL
3. Configure frontend with backend URL
4. Update backend FRONTEND_URL to frontend URL
5. Test both services

## URLs after deployment:
- Backend: https://your-backend-name.railway.app
- Frontend: https://your-frontend-name.railway.app