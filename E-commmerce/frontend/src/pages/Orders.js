import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPackage, FiCalendar, FiDollarSign, FiEye, FiArrowLeft, FiStar, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import getImageUrl from '../utils/getImageUrl';
import ReviewForm from '../components/common/ReviewForm';
import axios from 'axios';

const OrdersContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: var(--light-gray);
`;

const Header = styled.div`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
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
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const OrderCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-fast);
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
`;

const OrderHeader = styled.div`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--light-gray);
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-lg);
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const OrderInfo = styled.div`
  h3 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-lg);
  }
  
  p {
    color: var(--gray);
    font-size: var(--font-sm);
  }
`;

const OrderStatus = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 600;
  text-transform: uppercase;
  
  &.confirmed {
    background: var(--success-light);
    color: var(--success-dark);
  }
  
  &.processing {
    background: var(--warning-light);
    color: var(--warning-dark);
  }
  
  &.shipped {
    background: var(--info-light);
    color: var(--info-dark);
  }
  
  &.delivered {
    background: var(--success-light);
    color: var(--success-dark);
  }
`;

const OrderTotal = styled.div`
  text-align: right;
  
  .amount {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--primary-color);
  }
  
  .items {
    color: var(--gray);
    font-size: var(--font-sm);
  }
`;

const OrderItems = styled.div`
  padding: var(--spacing-xl);
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--gray);
    box-shadow: var(--shadow-md);
  }
`;

const ItemImage = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(45deg, var(--primary-light), var(--secondary-light))'};
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--white);
`;

const ItemInfo = styled.div`
  h4 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-xs);
  }
  
  p {
    color: var(--gray);
    font-size: var(--font-sm);
  }
`;

const ItemQuantity = styled.div`
  text-align: center;
  color: var(--gray);
  font-weight: 600;
`;

const ItemPrice = styled.div`
  text-align: right;
  color: var(--primary-color);
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: flex-end;
`;

const ReviewButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--accent-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;

  &:hover {
    background: #ff9800;
  }

  &:disabled {
    background: var(--gray);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  
  h3 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-lg);
  }
  
  p {
    color: var(--gray);
    margin-bottom: var(--spacing-xl);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--gray);
`;

const ProductModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
`;

const ProductModalContent = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
  }
`;

const ProductModalImage = styled.div`
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover no-repeat`
    : 'linear-gradient(45deg, var(--primary-light), var(--secondary-light))'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  color: var(--white);
  min-height: 350px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;

  @media (max-width: 768px) {
    min-height: 250px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
`;

const ProductModalTitle = styled.h2`
  margin: 0;
  color: var(--dark-gray);
  font-size: var(--font-2xl);
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-xl);
  color: var(--gray);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--dark-gray);
    transform: scale(1.1);
  }
`;

const ProductModalBody = styled.div`
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
`;

const ProductModalPrice = styled.div`
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--primary-color);
`;

const ProductModalDescription = styled.p`
  color: var(--gray);
  line-height: 1.6;
  margin: 0;
`;

const ProductModalCategory = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  color: var(--gray);
  font-size: var(--font-sm);
`;

const ReviewButtonInModal = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: var(--accent-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;
  width: 100%;

  &:hover {
    background: #ff9800;
  }
`;

const Orders = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      return getImageUrl(mainImage);
    }
    return null;
  };

  const getProductEmoji = (category) => {
    const emojiMap = {
      'Jewelry': '💎',
      'Home Decor': '🏠',
      'Art & Prints': '🎨',
      'Clothing': '👗',
      'Pottery': '🏺',
      'Woodwork': '🪵',
      'Textiles': '🧶',
      'Accessories': '👜',
      'Toys & Games': '🧸',
      'Beauty & Personal Care': '💄'
    };
    return emojiMap[category] || '🎁';
  };

  if (loading) {
    return (
      <OrdersContainer>
        <div className="container">
          <LoadingState>
            <h3>Loading your orders...</h3>
          </LoadingState>
        </div>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <div className="container">
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </BackButton>
          <div>
            <h1>Your Orders</h1>
            <p>Track and manage your purchases</p>
          </div>
        </Header>

        {orders.length > 0 ? (
          <OrdersList>
            {orders.map((order, index) => (
              <OrderCard
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrderHeader>
                  <OrderInfo>
                    <h3>Order #{order.orderNumber}</h3>
                    <p>
                      <FiCalendar style={{ marginRight: 'var(--spacing-xs)' }} />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </OrderInfo>
                  
                  <OrderStatus className={order.status}>
                    {order.status}
                  </OrderStatus>
                  
                  <OrderTotal>
                    <div className="amount">Rs.{order.pricing?.total?.toFixed(2) || order.total?.toFixed(2) || '0.00'}</div>
                    <div className="items">{order.items?.length || 0} items</div>
                  </OrderTotal>
                </OrderHeader>

                <OrderItems>
                  <ItemsList>
                    {order.items.map((item, itemIndex) => (
                      <OrderItem 
                        key={itemIndex}
                        onClick={() => setSelectedProduct({
                          ...item.product,
                          orderId: order._id,
                          orderStatus: order.status,
                          quantity: item.quantity,
                          itemName: item.name || item.product?.name
                        })}
                      >
                        <ItemImage $imageUrl={getProductImage(item.product)}>
                          {!getProductImage(item.product) && getProductEmoji(item.product?.category?.name || item.product?.category)}
                        </ItemImage>
                        
                        <ItemInfo>
                          <h4>{item.name || item.product?.name}</h4>
                          <p>Price: Rs.{item.price?.toFixed(2) || '0.00'}</p>
                        </ItemInfo>
                        
                        <ItemQuantity>
                          Qty: {item.quantity}
                        </ItemQuantity>
                        
                        <ItemPrice>
                          <div>Rs.{(item.subtotal || (item.price * item.quantity)).toFixed(2)}</div>
                        </ItemPrice>
                      </OrderItem>
                    ))}
                  </ItemsList>
                </OrderItems>
              </OrderCard>
            ))}
          </OrdersList>
        ) : (
          <EmptyState>
            <FiPackage size={64} color="var(--gray)" />
            <h3>No orders yet</h3>
            <p>When you make your first purchase, it will appear here.</p>
            <button 
              onClick={() => navigate('/products')}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--primary-color)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Start Shopping
            </button>
          </EmptyState>
        )}

        {/* Review Form Modal */}
        {showReviewForm && selectedReview && (
          <ReviewForm
            productId={selectedReview.productId}
            orderId={selectedReview.orderId}
            token={token}
            onClose={() => {
              setShowReviewForm(false);
              setSelectedReview(null);
            }}
            onSuccess={() => {
              // Refresh orders to show updated review status if needed
              fetchOrders();
            }}
          />
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal onClick={() => setSelectedProduct(null)}>
            <ProductModalContent onClick={(e) => e.stopPropagation()}>
              <ProductModalHeader>
                <ProductModalTitle>{selectedProduct.itemName || selectedProduct.name}</ProductModalTitle>
                <CloseButton onClick={() => setSelectedProduct(null)}>
                  <FiX size={24} />
                </CloseButton>
              </ProductModalHeader>

              <ProductModalImage $imageUrl={getProductImage(selectedProduct)}>
                {!getProductImage(selectedProduct) && getProductEmoji(selectedProduct.category?.name || selectedProduct.category)}
              </ProductModalImage>

              <ProductModalBody>
                <ProductModalPrice>Rs.{selectedProduct.price?.toFixed(2) || '0.00'}</ProductModalPrice>
                
                {selectedProduct.category && (
                  <ProductModalCategory>
                    Category: {selectedProduct.category?.name || selectedProduct.category}
                  </ProductModalCategory>
                )}

                {selectedProduct.description && (
                  <ProductModalDescription>
                    {selectedProduct.description}
                  </ProductModalDescription>
                )}

                {selectedProduct.orderStatus === 'delivered' && (
                  <ReviewButtonInModal 
                    onClick={() => {
                      setSelectedReview({
                        orderId: selectedProduct.orderId,
                        productId: selectedProduct._id,
                        productName: selectedProduct.itemName || selectedProduct.name
                      });
                      setShowReviewForm(true);
                      setSelectedProduct(null);
                    }}
                  >
                    <FiStar size={16} /> Write Review
                  </ReviewButtonInModal>
                )}
              </ProductModalBody>
            </ProductModalContent>
          </ProductModal>
        )}
      </div>
    </OrdersContainer>
  );
};

export default Orders;
