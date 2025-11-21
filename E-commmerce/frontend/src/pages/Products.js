import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiFilter, FiSearch } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import productService from '../services/productService';
import authService from '../services/authService';
import getImageUrl from '../utils/getImageUrl';

const ProductsContainer = styled.div`
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

const Title = styled.h1`
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--dark-gray);
`;

const FiltersSection = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
`;

const CategoryFilter = styled.select`
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: var(--white);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const ProductCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

const ProductImageContainer = styled.div`
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--white);
  overflow: hidden;
  
  // Add a border to visualize the container
  border: 1px solid #eee;
`;

const ProductImageBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => {
    if (props.$imageUrl && props.$imageLoaded !== false) {
      console.log('🎨 Setting background image:', props.$imageUrl);
      return `url("${props.$imageUrl}")`;
    }
    console.log('🎨 Using gradient background or loading state');
    return 'linear-gradient(45deg, var(--primary-light), var(--secondary-light))';
  }};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const ProductImageTag = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const ProductActions = styled.div`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);

  ${ProductCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--white);
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--primary-color);
    color: var(--white);
  }
`;

const ProductInfo = styled.div`
  padding: var(--spacing-lg);
`;

const ProductName = styled.h3`
  color: var(--dark-gray);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-lg);
  line-height: 1.4;
`;

const SellerName = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const Price = styled.span`
  color: var(--primary-color);
  font-weight: 600;
  font-size: var(--font-lg);
`;

const OriginalPrice = styled.span`
  color: var(--gray);
  text-decoration: line-through;
  font-size: var(--font-base);
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--primary-dark);
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

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  // Add image loading state
  const [imageLoadStates, setImageLoadStates] = useState({});
  
  const categories = [
    'All Categories',
    'Jewelry',
    'Home Decor',
    'Art & Prints',
    'Clothing',
    'Pottery',
    'Woodwork',
    'Textiles',
    'Accessories',
    'Toys & Games',
    'Beauty & Personal Care'
  ];

  useEffect(() => {
    // Get search term from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setDebouncedSearchTerm(searchQuery);
    }
    
    // Get category from URL parameters
    const categoryQuery = searchParams.get('category');
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    }
    
    fetchProducts();
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // Increased delay to 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    filterProducts();
  }, [products, debouncedSearchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🛍️ Fetching products from backend...');
      // Use the public products method instead of admin method
      const products = await productService.getPublicProducts();
      setProducts(products);
      console.log('✅ Fetched products:', products.length);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => (product.category?.name || product.category) === selectedCategory);
    }

    setFilteredProducts(filtered);
    
    // Update URL parameters
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.set('category', selectedCategory);
    }
    setSearchParams(params);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      const imageUrl = getImageUrl(mainImage);
      console.log('🖼️ Product image debug:', product.name, imageUrl, mainImage);
      return imageUrl;
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

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent navigation to product detail

    if (!authService.isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      console.log('🛒 Adding to cart from products page (context):', product._id);
      await addToCart(product, 1);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.message || error));
    }
  };

  const handleAddToWishlist = async (e, product) => {
    e.stopPropagation(); // Prevent navigation to product detail

    if (!authService.isAuthenticated()) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      console.log('💖 Adding to wishlist (cart) via context:', product._id);
      await addToCart(product, 1);
      alert('Product added to cart (wishlist) successfully!');
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      alert('Failed to add to wishlist: ' + (error.message || error));
    }
  };

  const handleImageLoad = (productId) => {
    console.log('🖼️ Image loaded for product:', productId);
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: true
    }));
  };
  
  const handleImageError = (productId) => {
    console.log('❌ Image failed to load for product:', productId);
    setImageLoadStates(prev => ({
      ...prev,
      [productId]: false
    }));
  };
  
  if (loading) {
    return (
      <ProductsContainer>
        <div className="container">
          <LoadingState>
            <h3>Loading products...</h3>
          </LoadingState>
        </div>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <div className="container">
        <Header>
          <Title>Handmade Products</Title>
          <FiltersSection>
            <SearchBox>
              <SearchIcon>
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiSearch />
                  </motion.div>
                ) : (
                  <FiSearch />
                )}
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <CategoryFilter
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </CategoryFilter>
          </FiltersSection>
        </Header>

        {filteredProducts.length > 0 ? (
          <ProductsGrid>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <ProductImageContainer>
                  <ProductImageBackground
                    $imageUrl={getProductImage(product)}
                    $imageLoaded={imageLoadStates[product._id] !== false}
                    $show={imageLoadStates[product._id] !== false}
                  />
                  <ProductImageTag
                    src={getProductImage(product)}
                    alt={product.name}
                    $show={imageLoadStates[product._id] !== false}
                    onLoad={() => handleImageLoad(product._id)}
                    onError={() => handleImageError(product._id)}
                  />
                  {(!getProductImage(product) || imageLoadStates[product._id] === false) && 
                    getProductEmoji(product.category?.name || product.category)}
                  {product.inventory?.quantity > 0 && (
                    <ProductActions>
                      <ActionButton onClick={(e) => handleAddToWishlist(e, product)}>
                        <FiHeart />
                      </ActionButton>
                    </ProductActions>
                  )}
                </ProductImageContainer>

                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <SellerName
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/seller/${product.seller?._id}`);
                    }}
                  >
                    by {product.seller?.firstName} {product.seller?.lastName}
                  </SellerName>

                  <PriceSection>
                    <Price>${product.price}</Price>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <OriginalPrice>${product.comparePrice}</OriginalPrice>
                    )}
                  </PriceSection>

                  <RatingSection>
                    <FiStar fill="var(--accent-color)" color="var(--accent-color)" />
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--gray)' }}>
                      New Product
                    </span>
                  </RatingSection>

                  {product.inventory?.quantity > 0 && (
                    <AddToCartButton onClick={(e) => handleAddToCart(e, product)}>
                      <FiShoppingCart />
                      Add to Cart
                    </AddToCartButton>
                  )}
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        ) : (
          <EmptyState>
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'No products have been added yet. Sellers can add their handmade products to get started!'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Link
                to="/register"
                style={{
                  display: 'inline-block',
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'var(--primary-color)',
                  color: 'var(--white)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600'
                }}
              >
                Become a Seller
              </Link>
            )}
          </EmptyState>
        )}
      </div>
    </ProductsContainer>
  );
};

export default Products;
