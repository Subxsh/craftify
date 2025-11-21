import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiHeart, FiShoppingCart, FiCalendar, FiPackage } from 'react-icons/fi';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import authService from '../services/authService';
import getImageUrl from '../utils/getImageUrl';

const ProfileContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  padding: var(--spacing-3xl) 0;
  margin-bottom: var(--spacing-2xl);
`;

const ProfileInfo = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-2xl);
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: var(--white);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
`;

const SellerDetails = styled.div`
  h1 {
    font-size: var(--font-3xl);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    opacity: 0.9;
    margin-bottom: var(--spacing-md);
    font-size: var(--font-lg);
  }
`;

const SellerStats = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
  
  .value {
    font-size: var(--font-xl);
    font-weight: 700;
    display: block;
  }
  
  .label {
    font-size: var(--font-sm);
    opacity: 0.8;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.9;
`;

const RatingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-2xl);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const Sidebar = styled.div``;

const SectionCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled.h3`
  color: var(--dark-gray);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-xl);
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-xl);
`;

const ProductCard = styled(motion.div)`
  border: 1px solid var(--light-gray);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: linear-gradient(45deg, var(--primary-light), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--white);
`;

const ProductInfo = styled.div`
  padding: var(--spacing-lg);
`;

const ProductName = styled.h4`
  color: var(--dark-gray);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-lg);
`;

const ProductPrice = styled.p`
  color: var(--primary-color);
  font-weight: 600;
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-sm);
`;

const ProductActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--primary-color);
  background: ${props => props.primary ? 'var(--primary-color)' : 'var(--white)'};
  color: ${props => props.primary ? 'var(--white)' : 'var(--primary-color)'};
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    background: ${props => props.primary ? 'var(--primary-dark)' : 'var(--primary-light)'};
    color: var(--white);
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--gray);
`;

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      console.log('👤 Fetching seller profile for:', sellerId);

      // Fetch seller's products using productService
      const products = await productService.getSellerProducts(sellerId);
      setProducts(products);

      // Create seller info from first product's seller data or use default
      if (products.length > 0 && products[0].seller) {
        const sellerData = products[0].seller;
        setSeller({
          ...sellerData,
          businessName: `${sellerData.firstName}'s Handmade Store`,
          bio: 'Passionate artisan creating beautiful handmade products with love and care.',
          location: 'Artisan Studio',
          memberSince: sellerData.createdAt,
          rating: 4.8,
          totalReviews: Math.floor(Math.random() * 100) + 50,
          totalSales: products.reduce((sum, product) => sum + (product.sales?.totalSold || 0), 0),
          responseTime: '2 hours',
          avatar: `${sellerData.firstName[0]}${sellerData.lastName[0]}`
        });
        console.log('✅ Seller profile loaded:', sellerData.firstName);
        console.log('✅ Seller products loaded:', products.length);
      } else {
        // If no products, create a basic seller profile
        setSeller({
          _id: sellerId,
          firstName: 'Seller',
          lastName: 'Profile',
          businessName: 'Handmade Store',
          bio: 'Welcome to our store!',
          location: 'Artisan Studio',
          rating: 5.0,
          totalReviews: 0,
          totalSales: 0,
          responseTime: '2 hours',
          avatar: 'SP'
        });
        console.log('✅ Basic seller profile created');
      }
    } catch (error) {
      console.error('❌ Error fetching seller data:', error);
      setSeller(null);
      setProducts([]);
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

  // useCart is imported at top; no runtime require needed

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent navigation to product detail

    if (!authService.isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      console.log('🛒 Adding to cart from seller profile (context):', product._id);
      await addToCart(product, 1);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.message || error));
    }
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
      <ProfileContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            Loading seller profile...
          </div>
        </div>
      </ProfileContainer>
    );
  }

  if (!seller) {
    return (
      <ProfileContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            Seller not found
          </div>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <div className="container">
          <ProfileInfo>
            <Avatar>{seller.avatar}</Avatar>
            
            <SellerDetails>
              <h1>{seller.businessName}</h1>
              <p>by {seller.firstName} {seller.lastName}</p>
              <LocationInfo>
                <FiMapPin />
                <span>{seller.location}</span>
              </LocationInfo>
              <RatingInfo>
                <FiStar fill="currentColor" />
                <span>{seller.rating} ({seller.totalReviews} reviews)</span>
              </RatingInfo>
            </SellerDetails>
            
            <SellerStats>
              <StatItem>
                <span className="value">{seller.totalSales}</span>
                <span className="label">Sales</span>
              </StatItem>
              <StatItem>
                <span className="value">{seller.rating}</span>
                <span className="label">Rating</span>
              </StatItem>
              <StatItem>
                <span className="value">{products.length}</span>
                <span className="label">Products</span>
              </StatItem>
            </SellerStats>
          </ProfileInfo>
        </div>
      </ProfileHeader>

      <div className="container">
        <ContentSection>
          <MainContent>
            <SectionCard>
              <SectionTitle>About {seller.firstName}</SectionTitle>
              <p style={{ lineHeight: '1.6', color: 'var(--gray)' }}>
                {seller.bio}
              </p>
            </SectionCard>

            <SectionCard>
              <SectionTitle>Products ({products.length})</SectionTitle>
              <ProductsGrid>
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <ProductImage>
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getProductEmoji(product.category?.name || product.category)
                      )}
                    </ProductImage>
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>Rs.{product.price}</ProductPrice>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                        <FiStar size={14} fill="var(--accent-color)" color="var(--accent-color)" />
                        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--gray)' }}>
                          {product.category?.name || product.category} • Stock: {product.inventory?.quantity || 0}
                        </span>
                      </div>
                      {product.inventory?.quantity > 0 && (
                        <ProductActions>
                          <ActionButton onClick={(e) => handleAddToCart(e, product)}>
                            <FiHeart /> Save
                          </ActionButton>
                          <ActionButton primary onClick={(e) => handleAddToCart(e, product)}>
                            <FiShoppingCart /> Add to Cart
                          </ActionButton>
                        </ProductActions>
                      )}
                    </ProductInfo>
                  </ProductCard>
                ))}
              </ProductsGrid>
            </SectionCard>
          </MainContent>

          <Sidebar>
            <SectionCard>
              <SectionTitle>Seller Information</SectionTitle>
              
              <InfoItem>
                <FiCalendar />
                <div>
                  <strong>Member since</strong><br />
                  {new Date(seller.memberSince).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </InfoItem>

              <InfoItem>
                <FiPackage />
                <div>
                  <strong>Total sales</strong><br />
                  {seller.totalSales} items sold
                </div>
              </InfoItem>

              <InfoItem>
                <FiStar />
                <div>
                  <strong>Average response time</strong><br />
                  {seller.responseTime}
                </div>
              </InfoItem>
            </SectionCard>

            <SectionCard>
              <SectionTitle>Shop Policies</SectionTitle>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--gray)', lineHeight: '1.6' }}>
                <p><strong>Returns:</strong> 30-day return policy</p>
                <p><strong>Shipping:</strong> 3-5 business days</p>
                <p><strong>Processing:</strong> 1-2 business days</p>
                <p><strong>Custom orders:</strong> Available upon request</p>
              </div>
            </SectionCard>
          </Sidebar>
        </ContentSection>
      </div>
    </ProfileContainer>
  );
};

export default SellerProfile;
