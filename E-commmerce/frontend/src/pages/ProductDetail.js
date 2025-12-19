import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiArrowLeft, FiUser, FiPackage, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';
import getImageUrl from '../utils/getImageUrl';
import Reviews from '../components/common/Reviews';
import ReviewForm from '../components/common/ReviewForm';
import axios from 'axios';

const ProductDetailContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: var(--light-gray);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: 1px solid var(--gray);
  color: var(--gray);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-bottom: var(--spacing-xl);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
  }
`;

const ProductContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.div`
  height: 500px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(45deg, var(--primary-light), var(--secondary-light))'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  color: var(--white);
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  overflow-x: auto;
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'var(--light-gray)'};
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  transition: border var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const ProductInfo = styled.div`
  padding: var(--spacing-2xl);
`;

const ProductName = styled.h1`
  color: var(--dark-gray);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-2xl);
  line-height: 1.3;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--primary-light);
  }
`;

const SellerAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const PriceSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const Price = styled.div`
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
`;

const OriginalPrice = styled.span`
  font-size: var(--font-lg);
  color: var(--gray);
  text-decoration: line-through;
  margin-left: var(--spacing-sm);
`;

const Savings = styled.div`
  color: var(--accent-color);
  font-weight: 600;
  font-size: var(--font-sm);
`;

const Description = styled.div`
  margin-bottom: var(--spacing-xl);

  h3 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-md);
  }

  p {
    color: var(--gray);
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
  }
`;

const ProductDetails = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--light-gray);

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: var(--gray);
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: var(--dark-gray);
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const { addToCart, buyNow } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);
  const [userOrders, setUserOrders] = useState([]);
  const [purchasedOrder, setPurchasedOrder] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🛍️ Fetching product details for ID:', id);
      const product = await productService.getProductById(id);
      console.log('✅ Product loaded:', product);
      console.log('Seller data:', product.seller); // Debug seller data
      setProduct(product);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      setError('Failed to load product details: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkUserPurchase = useCallback(async () => {
    if (!user || !token) {
      console.log('❌ No user or token');
      return;
    }
    
    try {
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Orders response:', response);
      
      // Handle both response.data.data and response.data directly
      const orders = response.data.data || response.data;
      console.log('📦 Orders fetched:', orders);
      setUserOrders(orders);
      
      // Find if user has purchased this product in a delivered/confirmed order
      const order = orders.find(order => {
        console.log(`🔍 Checking order ${order._id}: status=${order.status}`);
        // Accept 'delivered' or 'confirmed' status
        if (order.status !== 'delivered' && order.status !== 'confirmed') return false;
        
        return order.items.some(item => {
          const itemProductId = (item.product._id || item.product)?.toString();
          const currentId = id?.toString();
          console.log(`   Comparing item: ${itemProductId} === ${currentId} ?`);
          return itemProductId === currentId;
        });
      });
      
      console.log('✅ Purchased order:', order);
      if (order) {
        setPurchasedOrder(order);
      } else {
        console.log('❌ No delivered order found for this product');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [user, token, id]);

  const handleReviewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✅ Review button click handler called');
    console.log('Current state - showReviewForm:', showReviewForm);
    console.log('purchasedOrder:', purchasedOrder);
    setShowReviewForm(true);
    console.log('State updated to showReviewForm: true');
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  useEffect(() => {
    checkUserPurchase();
  }, [checkUserPurchase]);

  useEffect(() => {
    console.log('🔔 showReviewForm changed:', showReviewForm);
  }, [showReviewForm]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      console.log('🛒 Adding to cart via context:', product._id, 'quantity:', quantity);
      await addToCart(product, quantity);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.message || error));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to make a purchase');
      navigate('/login');
      return;
    }

    try {
      setPurchasing(true);
      console.log('💳 Processing purchase via context:', product._id, 'quantity:', quantity);

      const result = await buyNow(product, quantity);
      if (result && result.success) {
        console.log('✅ Purchase successful:', result.order);
        alert('Product Purchased Successfully');
        // Refresh the product to show updated stock
        fetchProduct();
        navigate('/orders');
      } else {
        throw new Error(result?.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('❌ Error making purchase:', error);
      alert('Failed to process purchase: ' + (error.message || error));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <ProductDetailContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <h3>Loading product details...</h3>
          </div>
        </div>
      </ProductDetailContainer>
    );
  }

  if (error || !product) {
    return (
      <ProductDetailContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <h3>Product Not Found</h3>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--primary-color)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Browse Products
            </button>
          </div>
        </div>
      </ProductDetailContainer>
    );
  }

  return (
    <ProductDetailContainer>
      <div className="container">
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </BackButton>

        <ProductContent>
          <ImageSection>
            <MainImage $imageUrl={product.images?.[selectedImage] ? getImageUrl(product.images[selectedImage]) : null}>
              {(!product.images || product.images.length === 0) && '🎁'}
            </MainImage>

            {product.images && product.images.length > 1 && (
              <ImageThumbnails>
                {product.images.map((image, index) => (
                  <Thumbnail
                    key={index}
                    $imageUrl={getImageUrl(image)}
                    active={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </ImageThumbnails>
            )}
          </ImageSection>

          <ProductInfo>
            <ProductName>{product.name}</ProductName>

            <Link to={`/seller/${product.seller?._id}`} style={{ textDecoration: 'none' }}>
              <SellerInfo>
                <SellerAvatar>
                  {product.seller?.firstName && product.seller?.lastName
                    ? `${product.seller.firstName[0]}${product.seller.lastName[0]}`
                    : product.seller?.firstName
                    ? product.seller.firstName[0]
                    : 'S'
                  }
                </SellerAvatar>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--dark-gray)' }}>
                    {product.seller?.firstName} {product.seller?.lastName || ''}
                  </div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--gray)' }}>
                    View seller profile →
                  </div>
                </div>
              </SellerInfo>
            </Link>

            <PriceSection>
              <Price>
                Rs.{product.price}
                {product.comparePrice && product.comparePrice > product.price && (
                  <OriginalPrice>Rs.{product.comparePrice}</OriginalPrice>
                )}
              </Price>
            </PriceSection>

            <Description>
              <h3>Description</h3>
              <p>{product.description}</p>
            </Description>

            <ProductDetails>
              <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                Product Details
              </h3>
              <DetailRow>
                <DetailLabel>Category</DetailLabel>
                <DetailValue>{product.category?.name || product.category}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Stock</DetailLabel>
                <DetailValue>
                  {product.inventory?.quantity > 0
                    ? `${product.inventory.quantity} available`
                    : 'Out of stock'
                  }
                </DetailValue>
              </DetailRow>
              {product.materials && Array.isArray(product.materials) && product.materials.length > 0 && (
                <DetailRow>
                  <DetailLabel>Materials</DetailLabel>
                  <DetailValue>{product.materials.join(', ')}</DetailValue>
                </DetailRow>
              )}
              {product.materials && typeof product.materials === 'string' && product.materials.trim() && (
                <DetailRow>
                  <DetailLabel>Materials</DetailLabel>
                  <DetailValue>{product.materials}</DetailValue>
                </DetailRow>
              )}
            </ProductDetails>

            {/* Quantity Selector */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                Quantity:
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--gray)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-base)'
                }}
                disabled={!product.inventory?.quantity}
              >
                {Array.from({ length: Math.min(product.inventory?.quantity || 0, 10) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons - Only show when in stock */}
            {product.inventory?.quantity > 0 && (
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-lg)',
                    background: 'var(--white)',
                    color: 'var(--primary-color)',
                    border: '2px solid var(--primary-color)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)'
                  }}
                  disabled={addingToCart}
                >
                  <FiShoppingCart />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-lg)',
                    background: 'var(--primary-color)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)'
                  }}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            )}

            {/* Wishlist Button - Adds to Cart - Only show when in stock */}
            {product.inventory?.quantity > 0 && (
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  background: 'var(--light-gray)',
                  color: 'var(--gray)',
                  border: '1px solid var(--gray)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)'
                }}
                disabled={addingToCart}
              >
                <FiHeart /> {addingToCart ? 'Adding to Cart...' : 'Add to Wishlist (Cart)'}
              </button>
            )}
          </ProductInfo>
        </ProductContent>

        {/* Review Form - Show if user purchased this product */}
        {purchasedOrder && (
          <div style={{ marginTop: 'var(--spacing-2xl)', padding: 'var(--spacing-2xl)', background: 'var(--white)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-2xl)' }}>
            <p style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--gray)' }}>You purchased this product! Share your experience below.</p>
            
            {!showReviewForm && (
              <button
                onClick={handleReviewClick}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'var(--accent-color)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-base)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-lg)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.background = '#ff9800'}
                onMouseLeave={(e) => e.target.style.background = 'var(--accent-color)'}
              >
                <FiStar size={18} /> Write a Review
              </button>
            )}
            
            {showReviewForm && (
              <ReviewForm 
                productId={id}
                orderId={purchasedOrder._id}
                productName={product?.name}
                token={token}
                onClose={() => {
                  console.log('Closing review form');
                  setShowReviewForm(false);
                }}
                onSuccess={() => {
                  console.log('Review submitted successfully');
                  setShowReviewForm(false);
                  setReviewsKey(reviewsKey + 1);
                }}
              />
            )}
          </div>
        )}

        {/* Reviews Section */}
        <Reviews 
          key={reviewsKey}
          productId={id}
        />
      </div>
    </ProductDetailContainer>
  );
};

export default ProductDetail;
