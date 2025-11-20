// Re-export all backend models for API access
module.exports = {
  User: require('../E-commmerce/backend/src/models/User'),
  Product: require('../E-commmerce/backend/src/models/Product'),
  Category: require('../E-commmerce/backend/src/models/Category'),
  Order: require('../E-commmerce/backend/src/models/Order'),
  Review: require('../E-commmerce/backend/src/models/Review'),
  Cart: require('../E-commmerce/backend/src/models/Cart')
};