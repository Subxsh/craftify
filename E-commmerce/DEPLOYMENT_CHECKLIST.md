# 📝 Deployment Checklist & URLs

## Required Accounts & Setup

### 1. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or you have Render connected to private repos

### 2. MongoDB Atlas (Database)
- [ ] Account created at: https://cloud.mongodb.com
- [ ] Free cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained

### 3. Render Account
- [ ] Account created at: https://render.com
- [ ] GitHub connected

### 4. Optional Services

#### Cloudinary (Image Storage)
- [ ] Account at: https://cloudinary.com
- [ ] Cloud name, API key, and secret obtained

#### Stripe (Payments)
- [ ] Account at: https://stripe.com
- [ ] Live keys obtained (or test keys for development)

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/craftify
JWT_SECRET=your-super-secure-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.onrender.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_live_your-secret-key
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
GENERATE_SOURCEMAP=false
```

## Deployment Steps Checklist

- [ ] 1. Set up MongoDB Atlas database
- [ ] 2. Create Cloudinary account (optional)
- [ ] 3. Create Stripe account (optional) 
- [ ] 4. Push code to GitHub with all deployment files
- [ ] 5. Create Render account and connect GitHub
- [ ] 6. Deploy backend service first
- [ ] 7. Configure backend environment variables
- [ ] 8. Deploy frontend static site
- [ ] 9. Configure frontend environment variables
- [ ] 10. Update CORS settings (FRONTEND_URL in backend)
- [ ] 11. Test the deployment

## Expected URLs After Deployment

- **Backend API**: https://craftify-backend.onrender.com
- **Frontend App**: https://craftify-frontend.onrender.com  
- **Health Check**: https://craftify-backend.onrender.com/api/health

## Important Notes

1. **Free Tier Limitations**: Services spin down after 15 minutes of inactivity
2. **Cold Start**: First request might take 30+ seconds after spin-down
3. **Environment Variables**: Must be set in Render dashboard, not in code
4. **CORS**: Update FRONTEND_URL after frontend is deployed
5. **Database**: Use MongoDB Atlas, not local MongoDB
6. **File Uploads**: Consider Cloudinary for production image storage

## Troubleshooting

If deployment fails:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB Atlas allows connections from 0.0.0.0/0
4. Check that Node.js version is compatible (18.x recommended)
5. Verify package.json start scripts are correct

## Security Checklist

- [ ] Strong JWT secret generated
- [ ] Database credentials are secure
- [ ] API keys are kept secret
- [ ] CORS properly configured
- [ ] HTTPS enforced in production
- [ ] Environment variables not committed to git