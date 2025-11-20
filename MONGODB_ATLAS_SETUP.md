# Connecting Craftify to MongoDB Atlas

This guide will help you connect your Craftify e-commerce project to MongoDB Atlas instead of using a local MongoDB instance.

## Prerequisites

1. A MongoDB Atlas account (free tier available at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
2. A deployed cluster in MongoDB Atlas

## Steps to Connect to MongoDB Atlas

### 1. Set Up MongoDB Atlas Cluster

1. Sign in to your MongoDB Atlas account
2. Create a new project (or use an existing one)
3. Create a new cluster (M0 free tier is fine for development)
4. Wait for the cluster to finish provisioning

### 2. Configure Network Access

1. In your Atlas dashboard, go to "Network Access" under Security
2. Click "Add IP Address"
3. For development, you can add your current IP or allow access from anywhere (0.0.0.0/0) - NOT recommended for production
4. Click "Confirm"

### 3. Create Database User

1. In your Atlas dashboard, go to "Database Access" under Security
2. Click "Add New Database User"
3. Enter a username and password (remember these!)
4. Give the user "Atlas Admin" permissions
5. Click "Add User"

### 4. Get Connection String

1. In your Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

### 5. Update Your Environment Variables

In your `.env` file, replace the `MONGODB_URI` value with your Atlas connection string:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster_url/craftify?retryWrites=true&w=majority
```

Replace:
- `your_username` with the database user you created
- `your_password` with the password for that user
- `your_cluster_url` with your actual cluster URL from Atlas

### 6. Test the Connection

Start your server:
```bash
npm run dev
```

You should see a message like:
```
✅ Connected to MongoDB: cluster0.example.mongodb.net
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check that your username and password are correct
2. **Network Access**: Make sure your IP is whitelisted in Atlas
3. **Connection Timeout**: Check your firewall settings

### Environment Specific Notes

- Make sure to use different databases for development, testing, and production environments
- Never commit your actual database credentials to version control
- Consider using environment variables for different environments

## Security Best Practices

1. Use strong passwords for database users
2. Limit IP addresses in the whitelist to only those necessary
3. Use different database users with minimal required permissions for different parts of your application
4. Regularly rotate credentials