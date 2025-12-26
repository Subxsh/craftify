import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrash2, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import getImageUrl from '../utils/getImageUrl';
import { toast } from 'react-toastify';

const WishlistContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: var(--light-gray);
`;

const WishlistContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
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
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
  }
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: var(--font-3xl);
  margin: 0;
`;

const EmptyState = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3xl);
  text-align: center;
  box-shadow: var(--shadow-md);

  h2 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-lg);
  }

  p {
    color: var(--gray);
    margin-bottom: var(--spacing-xl);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-xl);
`;

const ProductCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-5px);
  }
`;

const ProductImage = styled(Link)`
  display: block;
  height: 200px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(45deg, var(--primary-light), var(--secondary-light))'};
  background-size: cover;
  background-position: center;
  text-decoration: none;
  position: relative;

  &:hover {
    opacity: 0.9;
  }
`;

const ProductBody = styled.div`
  padding: var(--spacing-lg);
`;

const ProductName = styled(Link)`
  display: block;
  color: var(--dark-gray);
  font-size: var(--font-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--primary-color);
  }
`;

const ProductPrice = styled.div`
  color: var(--primary-color);
  font-size: var(--font-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
`;

const ProductDescription = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  background: ${props => props.$primary ? 'var(--primary-color)' : 'var(--white)'};
  color: ${props => props.$primary ? 'var(--white)' : 'var(--dark-gray)'};
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);

  &:hover {
    background: ${props => props.$primary ? 'var(--primary-dark)' : 'var(--light-gray)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  if (items.length === 0) {
    return (
      <WishlistContainer>
        <WishlistContent>
          <Header>
            <BackButton to="/products">
              <FiArrowLeft /> Back to Products
            </BackButton>
            <Title>My Wishlist</Title>
          </Header>
          
          <EmptyState>
            <h2>Your wishlist is empty</h2>
            <p>Start adding products to your wishlist by clicking the heart icon on product pages.</p>
            <Link to="/products" style={{ display: 'inline-block', marginTop: 'var(--spacing-lg)' }}>
              <ActionButton $primary>Browse Products</ActionButton>
            </Link>
          </EmptyState>
        </WishlistContent>
      </WishlistContainer>
    );
  }

  return (
    <WishlistContainer>
      <WishlistContent>
        <Header>
          <BackButton to="/products">
            <FiArrowLeft /> Back to Products
          </BackButton>
          <Title>My Wishlist ({items.length})</Title>
        </Header>

        <GridContainer>
          {items.map((product, index) => (
            <ProductCard
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductImage
                to={`/product/${product._id}`}
                $imageUrl={product.imageUrl ? getImageUrl(product.imageUrl) : null}
              />
              <ProductBody>
                <ProductName to={`/product/${product._id}`}>
                  {product.name}
                </ProductName>
                <ProductPrice>${product.price?.toFixed(2)}</ProductPrice>
                <ProductDescription>
                  {product.description?.substring(0, 80)}...
                </ProductDescription>
                <ProductActions>
                  <ActionButton
                    $primary
                    onClick={() => handleAddToCart(product)}
                  >
                    <FiShoppingCart /> Add to Cart
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleRemove(product._id)}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 />
                  </ActionButton>
                </ProductActions>
              </ProductBody>
            </ProductCard>
          ))}
        </GridContainer>
      </WishlistContent>
    </WishlistContainer>
  );
};

export default Wishlist;
