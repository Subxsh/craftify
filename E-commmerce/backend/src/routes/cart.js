const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    console.log('🛒 GET CART REQUEST for user:', req.user._id);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Populate cart with product details
    const cartItems = [];
    let totalItems = 0;
    let totalAmount = 0;

    for (const cartItem of user.cart || []) {
      try {
        const product = await Product.findById(cartItem.productId);
        if (product) {
          const subtotal = product.price * cartItem.quantity;
          cartItems.push({
            product: product,
            quantity: cartItem.quantity,
            price: product.price,
            subtotal: subtotal
          });
          totalItems += cartItem.quantity;
          totalAmount += subtotal;
        }
      } catch (err) {
        console.warn('Product not found for cart item:', cartItem.productId);
      }
    }

    console.log(`✅ Cart retrieved: ${cartItems.length} items, total $${totalAmount.toFixed(2)}`);

    res.json({
      success: true,
      cart: {
        items: cartItems,
        totalItems: totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart'
    });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    console.log('🛒 ADD TO CART REQUEST:', { productId, quantity, userId: req.user._id });

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find user and update cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if item already in cart
    const existingItemIndex = user.cart.findIndex(item => 
      item.productId && item.productId.toString() === productId.toString()
    );

    if (existingItemIndex >= 0) {
      user.cart[existingItemIndex].quantity += qty;
      console.log(`✅ Updated quantity for ${productId} to ${user.cart[existingItemIndex].quantity}`);
    } else {
      user.cart.push({ productId: productId, quantity: qty });
      console.log(`✅ Added new item ${productId} with quantity ${qty}`);
    }

    await user.save();

    // Return updated cart with product details
    const cartItems = [];
    let totalItems = 0;
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      try {
        const prod = await Product.findById(cartItem.productId);
        if (prod) {
          const subtotal = prod.price * cartItem.quantity;
          cartItems.push({
            product: prod,
            quantity: cartItem.quantity,
            price: prod.price,
            subtotal: subtotal
          });
          totalItems += cartItem.quantity;
          totalAmount += subtotal;
        }
      } catch (err) {
        console.warn('Product not found for cart item:', cartItem.productId);
      }
    }

    console.log('🛒 Cart updated successfully');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cartItems,
        totalItems: totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Helper function to remove item from cart
const removeItemFromCart = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.cart) {
    user.cart = [];
  }

  // Remove item from cart
  user.cart = user.cart.filter(item => 
    item.productId && item.productId.toString() !== productId.toString()
  );

  await user.save();

  // Return updated cart with product details
  const cartItems = [];
  let totalItems = 0;
  let totalAmount = 0;

  for (const cartItem of user.cart) {
    try {
      const product = await Product.findById(cartItem.productId);
      if (product) {
        const subtotal = product.price * cartItem.quantity;
        cartItems.push({
          product: product,
          quantity: cartItem.quantity,
          price: product.price,
          subtotal: subtotal
        });
        totalItems += cartItem.quantity;
        totalAmount += subtotal;
      }
    } catch (err) {
      console.warn('Product not found for cart item:', cartItem.productId);
    }
  }

  return {
    items: cartItems,
    totalItems: totalItems,
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

// Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    console.log('🗑️ REMOVE FROM CART REQUEST:', { productId, userId: req.user._id });

    const cart = await removeItemFromCart(req.user._id, productId);

    console.log(`✅ Item removed from cart`);

    res.json({
      success: true,
      cart: cart
    });

  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// Update cart item quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    console.log('🔄 UPDATE CART QUANTITY REQUEST:', { productId, quantity, userId: req.user._id });

    if (!productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and valid quantity are required'
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      try {
        const cart = await removeItemFromCart(req.user._id, productId);
        return res.json({
          success: true,
          cart: cart
        });
      } catch (error) {
        console.error('❌ Remove from cart error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to remove item from cart'
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // Find and update item quantity
    const itemIndex = user.cart.findIndex(item => 
      item.productId && item.productId.toString() === productId.toString()
    );

    if (itemIndex >= 0) {
      user.cart[itemIndex].quantity = quantity;
    } else {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    await user.save();

    // Return updated cart with product details
    const cartItems = [];
    let totalItems = 0;
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      try {
        const product = await Product.findById(cartItem.productId);
        if (product) {
          const subtotal = product.price * cartItem.quantity;
          cartItems.push({
            product: product,
            quantity: cartItem.quantity,
            price: product.price,
            subtotal: subtotal
          });
          totalItems += cartItem.quantity;
          totalAmount += subtotal;
        }
      } catch (err) {
        console.warn('Product not found for cart item:', cartItem.productId);
      }
    }

    console.log(`✅ Cart item quantity updated`);

    res.json({
      success: true,
      cart: {
        items: cartItems,
        totalItems: totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Update cart quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    console.log('🧹 CLEAR CART REQUEST for user:', req.user._id);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = [];
    await user.save();

    console.log('✅ Cart cleared');

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;