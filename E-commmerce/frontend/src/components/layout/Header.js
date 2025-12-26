import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--white);
  box-shadow: var(--shadow-md);
  z-index: 1000;
  transition: all var(--transition-normal);
`;

const TopBar = styled.div`
  background: var(--primary-color);
  color: var(--white);
  padding: var(--spacing-xs) 0;
  font-size: var(--font-sm);
  text-align: center;
`;

const MainHeader = styled.div`
  padding: var(--spacing-md) 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    gap: var(--spacing-md);
  }
`;

const Logo = styled(Link)`
  font-family: var(--font-secondary);
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  position: relative;
  
  @media (max-width: 768px) {
    display: ${props => props.isSearchOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--white);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-md);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: 3rem;
  border: 2px solid var(--gray);
  border-radius: var(--radius-full);
  font-size: var(--font-base);
  transition: border-color var(--transition-fast);
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray);
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--dark-gray);
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  position: relative;
  transition: all var(--transition-fast);
  
  &:hover {
    color: var(--primary-color);
    background: var(--light-gray);
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-xs);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--accent-color);
  color: var(--white);
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: var(--dark-gray);
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  
  &:hover {
    color: var(--primary-color);
    background: var(--light-gray);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) 0;
  min-width: 200px;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--dark-gray);
  text-decoration: none;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: var(--light-gray);
    color: var(--primary-color);
  }
`;

const DropdownButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--dark-gray);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: var(--light-gray);
    color: var(--primary-color);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--dark-gray);
  font-size: var(--font-xl);
  cursor: pointer;
  padding: var(--spacing-xs);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <HeaderContainer>
      <TopBar>
        <div className="container">
          Free shipping on orders over $50 | Handcrafted with love ❤️
        </div>
      </TopBar>
      
      <MainHeader>
        <div className="container">
          <HeaderContent>
            <Logo to="/">
              🎨 Craftify
            </Logo>

            <SearchContainer isSearchOpen={isSearchOpen}>
              <form onSubmit={handleSearch}>
                <SearchInput
                  type="text"
                  placeholder="Search for handmade treasures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchButton type="submit">
                  <FiSearch />
                </SearchButton>
              </form>
            </SearchContainer>

            <NavActions>
              <MobileMenuButton
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <FiSearch />
              </MobileMenuButton>

              <ActionButton as={Link} to="/wishlist" onClick={() => setIsUserMenuOpen(false)}>
                <FiHeart />
                {wishlistCount > 0 && (
                  <CartBadge>{wishlistCount}</CartBadge>
                )}
              </ActionButton>

              <ActionButton as={Link} to="/cart" onClick={() => setIsUserMenuOpen(false)}>
                <FiShoppingCart />
                {getCartItemCount() > 0 && (
                  <CartBadge>{getCartItemCount()}</CartBadge>
                )}
              </ActionButton>

              {user ? (
                <UserMenu ref={userMenuRef}>
                  <UserButton
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <FiUser />
                  </UserButton>
                  <DropdownMenu isOpen={isUserMenuOpen}>
                    <DropdownItem to="/profile" onClick={() => setIsUserMenuOpen(false)}>My Profile</DropdownItem>
                    <DropdownItem to="/orders" onClick={() => setIsUserMenuOpen(false)}>My Orders</DropdownItem>
                    {user.role === 'seller' && (
                      <DropdownItem to="/seller" onClick={() => setIsUserMenuOpen(false)}>Seller Dashboard</DropdownItem>
                    )}
                    {user.role === 'admin' && (
                      <DropdownItem to="/admin" onClick={() => setIsUserMenuOpen(false)}>Admin Panel</DropdownItem>
                    )}
                    <DropdownButton onClick={handleLogout}>
                      Logout
                    </DropdownButton>
                  </DropdownMenu>
                </UserMenu>
              ) : (
                <ActionButton as={Link} to="/login">
                  <FiUser />
                </ActionButton>
              )}

              <MobileMenuButton>
                <FiMenu />
              </MobileMenuButton>
            </NavActions>
          </HeaderContent>
        </div>
      </MainHeader>
    </HeaderContainer>
  );
};

export default Header;
