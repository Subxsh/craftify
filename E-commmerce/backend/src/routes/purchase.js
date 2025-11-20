const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/purchase
// @desc    Process purchase (Buy Now functionality)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    console.log('💳 PURCHASE REQUEST:', { items, shippingAddress, userId: req.user._id });
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required for purchase'
      });
    }
    
    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];
    const sellerUpdates = new Map(); // To track seller sales updates
    
    // Process each item
    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid product ID and quantity'
        });
      }
      
      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }
      
      // Check stock
      if (product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}, Requested: ${quantity}`
        });
      }
      
      // Calculate item subtotal
      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;
      
      // Add to order items
      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      
      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        image: mainImage ? { url: mainImage.url, alt: mainImage.alt } : {},
        price: product.price,
        quantity: quantity,
        subtotal: itemSubtotal
      });
      
      // Track seller sales for updating later
      if (sellerUpdates.has(product.seller.toString())) {
        const sellerUpdate = sellerUpdates.get(product.seller.toString());
        sellerUpdate.totalSold += quantity;
        sellerUpdate.revenue += itemSubtotal;
        sellerUpdates.set(product.seller.toString(), sellerUpdate);
      } else {
        sellerUpdates.set(product.seller.toString(), {
          totalSold: quantity,
          revenue: itemSubtotal
        });
      }
    }
    
    // Calculate pricing
    const shipping = 0; // For now, we can add shipping logic later
    const tax = 0; // For now, we can add tax logic later
    const discount = 0; // For now, we can add discount logic later
    const total = subtotal + shipping + tax - discount;
    
    // Create default shipping address if not provided
    const defaultAddress = {
      firstName: req.user.firstName || 'First',
      lastName: req.user.lastName || 'Last',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA',
      phone: ''
    };
    
    const finalShippingAddress = shippingAddress || defaultAddress;
    const finalBillingAddress = shippingAddress || defaultAddress;
    
    // Create order
    const orderData = {
      customer: req.user._id,
      items: orderItems,
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      },
      shippingAddress: {
        firstName: finalShippingAddress.firstName || defaultAddress.firstName,
        lastName: finalShippingAddress.lastName || defaultAddress.lastName,
        street: finalShippingAddress.street || defaultAddress.street,
        city: finalShippingAddress.city || defaultAddress.city,
        state: finalShippingAddress.state || defaultAddress.state,
        zipCode: finalShippingAddress.zipCode || defaultAddress.zipCode,
        country: finalShippingAddress.country || defaultAddress.country,
        phone: finalShippingAddress.phone || defaultAddress.phone
      },
      billingAddress: {
        firstName: finalBillingAddress.firstName || defaultAddress.firstName,
        lastName: finalBillingAddress.lastName || defaultAddress.lastName,
        street: finalBillingAddress.street || defaultAddress.street,
        city: finalBillingAddress.city || defaultAddress.city,
        state: finalBillingAddress.state || defaultAddress.state,
        zipCode: finalBillingAddress.zipCode || defaultAddress.zipCode,
        country: finalBillingAddress.country || defaultAddress.country
      },
      payment: {
        method: 'stripe', // Default payment method
        status: 'completed' // For demo purposes, mark as completed
      },
      status: 'confirmed'
    };
    
    // Generate order number using static method
    const orderNumber = await Order.generateOrderNumber();
    orderData.orderNumber = orderNumber;
    console.log('Generated order number:', orderNumber);
    
    // Create and save order
    const order = new Order(orderData);
    await order.save();
    
    // Update product inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.quantity': -item.quantity,
          'sales.totalSold': item.quantity,
          'sales.revenue': item.quantity * (await Product.findById(item.productId)).price
        },
        $set: {
          'sales.lastSaleDate': new Date()
        }
      });
    }
    
    // Update seller sales data
    for (const [sellerId, updateData] of sellerUpdates) {
      await User.findByIdAndUpdate(sellerId, {
        $inc: {
          'totalSales': updateData.totalSold,
          'totalRevenue': updateData.revenue
        }
      });
    }
    
    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] }
    });
    
    // Get updated user data to return to frontend
    const updatedUser = await User.findById(req.user._id).select('totalSales totalRevenue');
    
    console.log(`✅ Purchase completed successfully. Order ID: ${order._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Product Purchased Successfully',
      order: order,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase'
    });
  }
});

module.exports = router;