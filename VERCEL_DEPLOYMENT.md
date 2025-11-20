# Vercel Full-Stack Deployment Guide

## Overview
This configuration deploys both frontend and backend on Vercel:
- Frontend: Static React app served from `/`
- Backend: Serverless functions served from `/api/*`

## Environment Variables Required in Vercel:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/craftify
JWT_SECRET=your-super-secure-32-character-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Optional Variables (for features):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Deployment Steps:

1. **Set up MongoDB Atlas**
   - Create free cluster at cloud.mongodb.com
   - Get connection string

2. **Deploy on Vercel**
   - Go to vercel.com
   - Import GitHub repo: Subxsh/craftify
   - Vercel will auto-detect configuration from vercel.json

3. **Set Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all required variables above

4. **Test Deployment**
   - Frontend: https://your-app.vercel.app
   - Backend API: https://your-app.vercel.app/api/health

## Architecture:
- `/` → Frontend React app
- `/api/*` → Backend serverless functions
- Same domain, no CORS issues
- Automatic HTTPS
- Global CDN for frontend assets

## Notes:
- Backend runs as serverless functions (auto-scaling)
- Frontend is served as static files (fast CDN)
- MongoDB connection is optimized for serverless
- All routes handled properly for SPA