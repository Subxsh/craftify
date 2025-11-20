# 🚀 Craftify Deployment Guide for Render

This guide will walk you through deploying your full-stack e-commerce application (Craftify) to Render.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account**: For production database (free tier available)
4. **Cloudinary Account**: For image uploads (optional but recommended)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up and create a free cluster
3. Choose AWS as provider, and select a free tier region
4. Create a database user:
   - Go to Database Access
   - Add new user with username/password
   - Give read/write access
5. Configure network access:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow access from anywhere)
6. Get connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your user password
   - Replace `<dbname>` with `craftify`

## 🔧 Step 2: Prepare Your GitHub Repository

1. Push all your code to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

2. Make sure these files are in your repository:
   - ✅ `render.yaml` (deployment configuration)
   - ✅ `Dockerfile` (backend container)
   - ✅ `Dockerfile.frontend` (frontend container)
   - ✅ `.gitignore` (ignore sensitive files)

## 🌐 Step 3: Deploy Backend API

### Option A: Using Render Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Configure environment variables:

### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `craftify-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Auto-Deploy**: Yes

### Environment Variables for Backend:

Add these in Render Dashboard → Service → Environment:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/craftify?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-service.onrender.com
```

**Optional Variables** (if using these services):
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## 🎨 Step 4: Deploy Frontend

1. In Render Dashboard, click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `craftify-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Auto-Deploy**: Yes

### Update Frontend Environment

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-service.onrender.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## 🔄 Step 5: Update CORS Configuration

After both services are deployed, update the backend environment variable:

1. Go to your backend service in Render
2. Update `FRONTEND_URL` to your actual frontend URL
3. This enables CORS for your frontend domain

## 📱 Step 6: Configure Frontend API Calls

Update your frontend API configuration to use the production backend URL.

If you have an API configuration file, update it:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-service.onrender.com/api'
  : 'http://localhost:5000/api';
```

## 🧪 Step 7: Test Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-service.onrender.com/api/health`
2. **Frontend**: Visit your frontend URL
3. **API Integration**: Test login, product viewing, and other features

## 🔍 Step 8: Monitor and Debug

### Check Logs:
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab to see real-time logs

### Common Issues:
- **Build Failures**: Check if all dependencies are in package.json
- **Environment Variables**: Ensure all required vars are set
- **CORS Errors**: Verify FRONTEND_URL matches your frontend domain
- **Database Connection**: Check MongoDB Atlas network access and credentials

## 🎯 Step 9: Custom Domain (Optional)

1. In Render Dashboard, go to your frontend service
2. Go to "Settings" → "Custom Domains"
3. Add your domain name
4. Update your DNS records as instructed

## 💡 Pro Tips

1. **Free Tier Limitations**: Render free tier spins down after 15 minutes of inactivity
2. **Cold Starts**: First request after spin-down might take 30+ seconds
3. **Database**: Use MongoDB Atlas free tier for production database
4. **File Uploads**: Consider using Cloudinary for image storage instead of local storage
5. **Monitoring**: Set up uptime monitoring to keep your service warm

## 🚨 Security Checklist

- ✅ Use strong JWT_SECRET
- ✅ Set NODE_ENV=production
- ✅ Configure proper CORS origins
- ✅ Use HTTPS-only cookies in production
- ✅ Validate all environment variables are set
- ✅ Use database connection with authentication
- ✅ Don't commit .env files to git

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test API endpoints directly
4. Check GitHub Actions (if using CI/CD)

Your application should now be live! 🎉

**Backend URL**: `https://your-backend-service.onrender.com`
**Frontend URL**: `https://your-frontend-service.onrender.com`

Remember to update any hardcoded URLs in your application to use the production URLs.