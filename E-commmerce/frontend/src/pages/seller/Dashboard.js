import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiPackage, FiDollarSign, FiEye, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import authService from '../../services/authService';
import getImageUrl from '../../utils/getImageUrl';

const DashboardContainer = styled.div`
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
`;

const WelcomeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
`;

const WelcomeText = styled.div`
  h1 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--gray);
    font-size: var(--font-lg);
  }
`;

const AddProductButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--primary-color);
  color: var(--white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const StatCard = styled(motion.div)`
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color || 'var(--primary-color)'};
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  font-size: var(--font-xl);
`;

const StatValue = styled.h3`
  font-size: var(--font-2xl);
  color: var(--dark-gray);
  margin-bottom: var(--spacing-sm);
`;

const StatLabel = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
`;

const ProductsSection = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
`;

const ProductCard = styled(motion.div)`
  border: 1px solid var(--light-gray);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-fast);

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
  border: 1px solid var(--gray);
  background: var(--white);
  color: var(--gray);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--light-gray);
  }

  &.edit {
    color: var(--primary-color);
    border-color: var(--primary-color);

    &:hover {
      background: var(--primary-light);
    }
  }

  &.delete {
    color: #dc3545;
    border-color: #dc3545;

    &:hover {
      background: #f8d7da;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--gray);

  h3 {
    margin-bottom: var(--spacing-lg);
    color: var(--dark-gray);
  }

  p {
    margin-bottom: var(--spacing-xl);
  }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--white);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--primary-light);
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  // Fetch real products from database
  useEffect(() => {
    if (user) {
      fetchSellerProducts();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchSellerProducts();
      }, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      console.log('🛍️ Fetching seller products for user:', user._id);
      const products = await productService.getSellerProducts(user._id);
      setProducts(products);

      // Calculate real stats from actual products using proper fields
      const totalProducts = products.length;
      
      // Calculate total sales from the sales.totalSold field
      const totalSales = products.reduce((sum, product) => {
        return sum + (product.sales?.totalSold || 0);
      }, 0);
      
      // Calculate total revenue from the sales.revenue field
      const productRevenue = products.reduce((sum, product) => {
        return sum + (product.sales?.revenue || 0);
      }, 0);
      
      // Calculate average rating from the reviews.averageRating field
      const validRatings = products.filter(product => product.reviews?.averageRating > 0);
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((sum, product) => sum + (product.reviews?.averageRating || 0), 0) / validRatings.length
        : 0;

      // Use seller's profile revenue if available, otherwise use product-based revenue
      const totalRevenue = user.totalRevenue || productRevenue;

      setStats({
        totalProducts,
        totalSales,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        averageRating: parseFloat(averageRating).toFixed(1)
      });

      console.log('✅ Fetched seller products:', products.length);
    } catch (error) {
      console.error('❌ Error fetching seller products:', error);
      setProducts([]);
      setStats({
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (productId) => {
    console.log('✏️ Editing product:', productId);
    navigate(`/seller/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🗑️ Deleting product:', productId);
        await productService.deleteProduct(productId);
        console.log('✅ Product deleted successfully');

        // Refresh the products list
        fetchSellerProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
      }
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

  return (
    <DashboardContainer>
      <div className="container">
        <Header>
          <WelcomeSection>
            <WelcomeText>
              <h1>Welcome back, {user?.firstName}! 👋</h1>
              <p>Manage your products and track your sales</p>
            </WelcomeText>
            <AddProductButton to="/seller/add-product">
              <FiPlus /> Add New Product
            </AddProductButton>
          </WelcomeSection>
        </Header>

        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatIcon color="var(--primary-color)">
              <FiPackage />
            </StatIcon>
            <StatValue>{stats.totalProducts}</StatValue>
            <StatLabel>Total Products</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatIcon color="var(--accent-color)">
              <FiDollarSign />
            </StatIcon>
            <StatValue>${stats.totalRevenue}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatIcon color="var(--secondary-color)">
              <FiEye />
            </StatIcon>
            <StatValue>{stats.totalSales}</StatValue>
            <StatLabel>Total Sales</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatIcon color="#ffc107">
              <FiStar />
            </StatIcon>
            <StatValue>{stats.averageRating}</StatValue>
            <StatLabel>Average Rating</StatLabel>
          </StatCard>
        </StatsGrid>

        <ProductsSection>
          <SectionHeader>
            <h2>Your Products</h2>
            <RefreshButton onClick={fetchSellerProducts} disabled={loading}>
              {loading ? 'Loading...' : <><FiEye /> Refresh</>}
            </RefreshButton>
          </SectionHeader>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <h3>Loading your products...</h3>
            </div>
          ) : products.length > 0 ? (
            <ProductsGrid>
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
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
                    <ProductPrice>${product.price}</ProductPrice>
                    <p style={{ color: 'var(--gray)', fontSize: 'var(--font-sm)' }}>
                      {product.category?.name || product.category} • {product.status}
                    </p>
                    <p style={{ color: 'var(--gray)', fontSize: 'var(--font-sm)' }}>
                      Stock: {product.inventory?.quantity || product.quantity || 0}
                    </p>
                    <ProductActions>
                      <ActionButton
                        className="edit"
                        onClick={() => handleEditProduct(product._id)}
                      >
                        <FiEdit /> Edit
                      </ActionButton>
                      <ActionButton
                        className="delete"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FiTrash2 /> Delete
                      </ActionButton>
                    </ProductActions>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          ) : (
            <EmptyState>
              <h3>No products yet</h3>
              <p>Start by adding your first handmade product to your store</p>
              <AddProductButton to="/seller/add-product">
                <FiPlus /> Add Your First Product
              </AddProductButton>
            </EmptyState>
          )}
        </ProductsSection>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
