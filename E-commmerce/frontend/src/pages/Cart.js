import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import getImageUrl from '../utils/getImageUrl';

const CartContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: var(--light-gray);
`;

const Header = styled.div`
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: 1px solid var(--gray);
  color: var(--gray);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-2xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

const CartItem = styled(motion.div)`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--light-gray);
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: var(--spacing-lg);
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ProductImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  background: var(--light-gray);
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ProductName = styled.h3`
  margin: 0;
  color: var(--dark-gray);
`;

const ProductPrice = styled.p`
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--primary-color);
`;

const SellerName = styled.p`
  margin: 0;
  font-size: var(--font-sm);
  color: var(--gray);
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
`;

const QuantityButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);

  &:hover {
    color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 var(--spacing-sm);
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);

  &:hover {
    background: var(--error-light);
  }
`;

const CartSummary = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  height: fit-content;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--dark-gray);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);

  &.total {
    font-weight: 600;
    font-size: var(--font-lg);
    border-top: 1px solid var(--light-gray);
    padding-top: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);

  &:hover {
    background: var(--primary-dark);
  }

  &:disabled {
    background: var(--gray);
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-3xl);
  text-align: center;
`;

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Fetching user cart...');
      const cartData = await cartService.getCart();
      
      console.log('📦 Raw cart data from service:', JSON.stringify(cartData, null, 2));

      // Filter out items with null/missing products
      if (cartData && cartData.items) {
        const validItems = cartData.items.filter(item => item.product && item.product._id);
        const invalidItems = cartData.items.filter(item => !item.product || !item.product._id);
        
        console.log('✅ Valid items:', validItems.length);
        console.log('❌ Invalid items:', invalidItems.length);
        
        if (invalidItems.length > 0) {
          console.log('🧹 Found', invalidItems.length, 'invalid cart items, cleaning up...');
          // Clean up invalid items by removing them
          for (const invalidItem of invalidItems) {
            try {
              await cartService.removeFromCart(invalidItem.product?._id || 'invalid');
            } catch (cleanupError) {
              console.log('⚠️ Could not remove invalid item:', cleanupError.message);
            }
          }
          
          // Update cart with only valid items
          cartData.items = validItems;
          cartData.totalItems = validItems.reduce((total, item) => total + item.quantity, 0);
          cartData.totalAmount = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
      }
      
      console.log('📊 Final cart data:', JSON.stringify(cartData, null, 2));
      
      setCart(cartData);
      console.log('✅ Cart loaded:', cartData?.items?.length || 0, 'valid items');
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(true);
      console.log('🔄 Updating quantity:', productId, newQuantity);
      const updatedCart = await cartService.updateCartItem(productId, newQuantity);
      setCart(updatedCart);
      console.log('✅ Quantity updated');
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      alert('Failed to update quantity: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(true);
      console.log('🗑️ Removing item:', productId);
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
      console.log('✅ Item removed');
    } catch (error) {
      console.error('❌ Error removing item:', error);
      alert('Failed to remove item: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    try {
      console.log('💳 Processing checkout...');
      const items = cart.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.price
      }));

      const order = await cartService.purchaseItems(items);
      console.log('✅ Purchase successful:', order);
      alert('Purchase successful! Redirecting to orders...');
      navigate('/orders');
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    }
  };

  const getProductImage = (product) => {
    console.log('🖼️ getProductImage called with:', product);
    if (product && product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      const imageUrl = getImageUrl(mainImage);
      console.log('🖼️ Product image URL:', imageUrl, 'from image:', mainImage);
      return imageUrl;
    }
    console.log('🖼️ No valid image found for product');
    return null;
  };

  const getProductEmoji = (category) => {
    const emojiMap = {
      'Home Decor': '🏠',
      'Accessories': '👜',
      'Jewelry': '💎',
      'Clothing': '👕',
      'Art': '🎨',
      'Furniture': '🪑',
      'Kitchen & Dining': '🍽️',
      'Bath & Beauty': '🛁',
      'Toys & Games': '🎮',
      'Electronics': '📱',
      'Books': '📚',
      'Other': '🎁'
    };
    return emojiMap[category] || '🎁';
  };

  if (loading) {
    return (
      <CartContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <h3>Loading your cart...</h3>
          </div>
        </div>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <div className="container">
        <Header>
          <div>
            <BackButton to="/products">
              <FiArrowLeft /> Continue Shopping
            </BackButton>
          </div>
          <div>
            <h1>
              <FiShoppingCart /> Your Cart ({cart?.totalItems || 0})
            </h1>
          </div>
        </Header>

        {!cart || cart.items.length === 0 ? (
          <EmptyCart>
            <FiShoppingCart size={64} color="var(--gray)" />
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products" style={{
              display: 'inline-block',
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: 'var(--primary-color)',
              color: 'var(--white)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)'
            }}>
              Browse Products
            </Link>
          </EmptyCart>
        ) : (
          <CartContent>
            <CartItems>
              {cart.items.filter(item => {
                const isValid = item.product && item.product._id;
                console.log('🔍 Cart item filter check:', { item, isValid });
                return isValid;
              }).map((item, index) => {
                console.log('🎨 Rendering cart item:', { item, index });
                return (
                  <CartItem
                    key={item.product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductImage $imageUrl={getProductImage(item.product)}>
                      {!getProductImage(item.product) && getProductEmoji(item.product?.category || 'Other')}
                    </ProductImage>
                    
                    <ProductInfo>
                      <ProductName>{item.product?.name || 'Product Unavailable'}</ProductName>
                      <ProductPrice>${item.price}</ProductPrice>
                      <SellerName>by {item.product?.seller?.firstName || 'Unknown'} {item.product?.seller?.lastName || 'Seller'}</SellerName>
                    </ProductInfo>
                    
                    <QuantityControls>
                      <QuantityButton
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                      >
                        <FiMinus />
                      </QuantityButton>
                      <QuantityDisplay>{item.quantity}</QuantityDisplay>
                      <QuantityButton
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={updating}
                      >
                        <FiPlus />
                      </QuantityButton>
                    </QuantityControls>
                    
                    <RemoveButton
                      onClick={() => removeItem(item.product._id)}
                      disabled={updating}
                    >
                      <FiTrash2 />
                    </RemoveButton>
                  </CartItem>
                );
              })}
            </CartItems>

            <CartSummary>
              <SummaryTitle>Order Summary</SummaryTitle>

              <SummaryRow>
                <span>Items ({cart.totalItems})</span>
                <span>${cart.totalAmount?.toFixed(2)}</span>
              </SummaryRow>

              <SummaryRow>
                <span>Shipping</span>
                <span>Free</span>
              </SummaryRow>

              <SummaryRow className="total">
                <span>Total</span>
                <span>${cart.totalAmount?.toFixed(2)}</span>
              </SummaryRow>

              <CheckoutButton onClick={handleCheckout} disabled={updating}>
                <FiCreditCard />
                Proceed to Checkout
              </CheckoutButton>
            </CartSummary>
          </CartContent>
        )}
      </div>
    </CartContainer>
  );
};

export default Cart;
