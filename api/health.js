// Vercel serverless function for health check
module.exports = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Craftify API is running on Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
};