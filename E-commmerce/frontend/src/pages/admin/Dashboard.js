import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign, 
  FiSettings,
  FiLogOut,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiXCircle,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import userService from '../../services/userService';
import orderService from '../../services/orderService';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  padding: var(--spacing-xl) 0;
`;

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  width: 280px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-right: 2px solid #d4af37;
  padding: var(--spacing-xl) 0;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 5px 0 20px rgba(0, 0, 0, 0.5);
`;

const SidebarItem = styled.div`
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: ${props => props.active ? '#d4af37' : '#e0e0e0'};
  background: ${props => props.active ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '500'};
  margin: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' : 'rgba(212, 175, 55, 0.1)'};
    color: ${props => props.active ? '#d4af37' : '#d4af37'};
    transform: translateX(5px);
  }
  
  svg {
    font-size: 1.3rem;
  }
`;

const MainContent = styled.div`
  margin-left: 280px;
  padding: 0 var(--spacing-2xl);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #d4af37;
`;

const WelcomeSection = styled.div`
  h1 {
    color: #d4af37;
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-3xl);
    font-weight: 700;
  }
  
  p {
    color: #b0b0b0;
    font-size: var(--font-lg);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #1a1a2e;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  
  &:hover {
    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  transition: all var(--transition-normal);
  border: 1px solid #d4af37;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(212, 175, 55, 0.15);
  }
`;

const StatIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  font-size: 2rem;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  font-weight: 700;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: var(--font-2xl);
  font-weight: 700;
  color: #d4af37;
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  color: #b0b0b0;
  font-size: var(--font-sm);
  font-weight: 500;
`;

const Section = styled.div`
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  border-radius: var(--radius-lg);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
  border: 1px solid #d4af37;
`;

const SectionHeader = styled.div`
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
  border-bottom: 2px solid #d4af37;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    color: #d4af37;
    margin: 0;
    font-size: var(--font-2xl);
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const SearchInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid #d4af37;
  background: #1a1a2e;
  color: #d4af37;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  width: 250px;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
`;

const TableHeader = styled.th`
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: left;
  font-weight: 700;
  color: #d4af37;
  border-bottom: 2px solid #d4af37;
  font-size: var(--font-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #333;
  transition: all var(--transition-fast);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(212, 175, 55, 0.05);
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-lg) var(--spacing-xl);
  color: #e0e0e0;
  font-size: var(--font-sm);
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 2px solid #d4af37;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: #d4af37;
  margin-right: var(--spacing-sm);
  font-size: 1.1rem;
  
  &:hover {
    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
    color: #1a1a2e;
    border-color: #d4af37;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  }
  
  &.delete:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    border-color: #ff6b6b;
    color: var(--white);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
  
  &.edit:hover {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a49e 100%);
    border-color: #4ecdc4;
    color: var(--white);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
  }
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  
  &.pending {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1));
    color: #ffa500;
    border: 1px solid rgba(255, 152, 0, 0.4);
  }
  
  &.confirmed {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
    color: #4ecdc4;
    border: 1px solid rgba(78, 205, 196, 0.4);
  }
  
  &.processing {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
    color: #d4af37;
    border: 1px solid rgba(212, 175, 55, 0.4);
  }
  
  &.shipped {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
    color: #8b5cf6;
    border: 1px solid rgba(139, 92, 246, 0.4);
  }
  
  &.delivered {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.4);
  }
  
  &.cancelled {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.4);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: var(--spacing-lg);
`;

const ModalHeader = styled.div`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalBody = styled.div`
  padding: var(--spacing-xl);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray);
  cursor: pointer;
  padding: var(--spacing-xs);
  
  &:hover {
    color: var(--dark-gray);
  }
`;

const ProductDetailGrid = styled.div`
  display: grid;
  gap: var(--spacing-lg);
`;

const ProductDetailItem = styled.div`
  h4 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-sm);
    text-transform: uppercase;
    font-weight: 600;
  }
  
  p {
    color: var(--gray);
    line-height: 1.5;
  }
`;

const ProductImageModal = styled.div`
  width: 100%;
  height: 200px;
  background: var(--light-gray);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--gray);
  margin-bottom: var(--spacing-lg);
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [demandProducts, setDemandProducts] = useState([]); // New state for demand products
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsData, pendingProductsData, usersData, ordersData] = await Promise.all([
        productService.getAllProducts(),
        productService.getPendingProducts(),
        userService.getAllUsers(),
        orderService.getAllOrders()
      ]);
      
      console.log('Products data received:', productsData);
      console.log('Pending products data received:', pendingProductsData);
      console.log('Products count:', productsData.length);
      
      // Log each product to check for duplicates
      productsData.forEach((product, index) => {
        console.log(`Product ${index + 1}: ${product.name} (ID: ${product._id})`);
      });
      
      // Filter out deleted products (where isDeleted is true)
      const activeProducts = productsData.filter(product => !product.isDeleted);
      
      // Get top 5 demand products (sorted by totalSold)
      const topDemandProducts = [...activeProducts]
        .sort((a, b) => (b.sales?.totalSold || 0) - (a.sales?.totalSold || 0))
        .slice(0, 5);
      
      setProducts(activeProducts);
      setPendingProducts(pendingProductsData);
      setUsers(usersData);
      setOrders(ordersData);
      setDemandProducts(topDemandProducts); // Set demand products
      
      // Calculate stats
      const totalProducts = activeProducts.length;
      const totalUsers = usersData.length;
      const totalOrders = ordersData.length;
      
      // Calculate total revenue from all orders
      const totalRevenue = ordersData.reduce((sum, order) => {
        return sum + (order.pricing?.total || order.totalAmount || 0);
      }, 0);
      
      setStats({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2)
      });
      
      console.log('Stats updated:', { totalProducts, totalUsers, totalOrders, totalRevenue });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product approval actions
  const handleApproveProduct = async (product) => {
    console.log('Approve product:', product);
    if (window.confirm(`Approve "${product.name}" for publication?`)) {
      try {
        await productService.approveProduct(product._id);
        
        // Remove from pending list and add to active products
        setPendingProducts(prevPending => prevPending.filter(p => p._id !== product._id));
        setProducts(prevProducts => [...prevProducts, { ...product, approvalStatus: 'approved', status: 'active' }]);
        
        alert(`Product "${product.name}" approved successfully!`);
      } catch (error) {
        console.error('Error approving product:', error);
        alert('Failed to approve product: ' + error.message);
      }
    }
  };

  const handleRejectProduct = async (product) => {
    console.log('Reject product:', product);
    const reason = prompt(`Please provide a reason for rejecting "${product.name}":`);
    if (reason && reason.trim()) {
      try {
        await productService.rejectProduct(product._id, reason.trim());
        
        // Remove from pending list
        setPendingProducts(prevPending => prevPending.filter(p => p._id !== product._id));
        
        alert(`Product "${product.name}" rejected successfully!`);
      } catch (error) {
        console.error('Error rejecting product:', error);
        alert('Failed to reject product: ' + error.message);
      }
    } else {
      alert('Rejection reason is required.');
    }
  };

  // Product actions
  const handleViewProduct = (product) => {
    console.log('View product:', product);
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    console.log('Edit product:', product);
    // For now, we'll just show an alert
    alert(`Edit product functionality would open edit form for: ${product.name}`);
    // In a real implementation, this would open a modal or navigate to an edit page
  };

  const handleDeleteProduct = async (product) => {
    console.log('Delete product:', product);
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        // Call the API to delete the product
        await productService.deleteProduct(product._id);
        
        // Immediately remove the product from the UI
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
        setDemandProducts(prevDemandProducts => prevDemandProducts.filter(p => p._id !== product._id));
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          totalProducts: prevStats.totalProducts - 1
        }));
        
        alert(`Product "${product.name}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  // User actions
  const handleViewUser = (user) => {
    console.log('View user:', user);
    // Navigate to user profile or detail page
    alert(`View user: ${user.firstName} ${user.lastName}`);
  };

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    // Open edit user modal or page
    alert(`Edit user functionality would open for: ${user.firstName} ${user.lastName}`);
  };

  const handleDeleteUser = async (user) => {
    console.log('Delete user:', user);
    if (window.confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      try {
        // Call the API to delete the user
        await userService.deleteUser(user._id);
        alert(`User "${user.firstName} ${user.lastName}" deleted successfully!`);
        // Refresh the user list
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  // Order actions
  const handleViewOrder = (order) => {
    console.log('View order:', order);
    // Navigate to order detail page
    alert(`View order: ${order.orderNumber}`);
  };

  const handleEditOrder = (order) => {
    console.log('Edit order:', order);
    // Open edit order modal or page
    alert(`Edit order functionality would open for: ${order.orderNumber}`);
  };

  const handleDeleteOrder = async (order) => {
    console.log('Delete order:', order);
    if (window.confirm(`Are you sure you want to delete order "${order.orderNumber}"? This action cannot be undone.`)) {
      try {
        // Call the API to delete the order
        await orderService.deleteOrder(order._id);
        alert(`Order "${order.orderNumber}" deleted successfully!`);
        // Refresh the order list
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <h3>Loading dashboard...</h3>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarItem active={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')}>
          <FiHome /> Dashboard
        </SidebarItem>
        <SidebarItem active={activeSection === 'products'} onClick={() => setActiveSection('products')}>
          <FiPackage /> Products
        </SidebarItem>
        <SidebarItem active={activeSection === 'pending-approvals'} onClick={() => setActiveSection('pending-approvals')}>
          <FiClock /> Product Approvals
        </SidebarItem>
        <SidebarItem active={activeSection === 'users'} onClick={() => setActiveSection('users')}>
          <FiUsers /> Users
        </SidebarItem>
        <SidebarItem active={activeSection === 'orders'} onClick={() => setActiveSection('orders')}>
          <FiShoppingCart /> Orders
        </SidebarItem>
        <SidebarItem>
          <FiSettings /> Settings
        </SidebarItem>
      </Sidebar>

      <MainContent>
        <Header>
          <WelcomeSection>
            <h1>Welcome back, Admin! 👋</h1>
            <p>Manage your platform and track performance</p>
          </WelcomeSection>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut /> Logout
          </LogoutButton>
        </Header>

        {activeSection === 'dashboard' && (
          <>
            <StatsGrid>
              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatIcon color="var(--primary-color)">
                  <FiPackage />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.totalProducts}</StatValue>
                  <StatLabel>Total Products</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatIcon color="var(--accent-color)">
                  <FiUsers />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.totalUsers}</StatValue>
                  <StatLabel>Total Users</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatIcon color="var(--secondary-color)">
                  <FiShoppingCart />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.totalOrders}</StatValue>
                  <StatLabel>Total Orders</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatIcon color="#ffc107">
                  <FiDollarSign />
                </StatIcon>
                <StatInfo>
                  <StatValue>Rs.{stats.totalRevenue}</StatValue>
                  <StatLabel>Total Revenue</StatLabel>
                </StatInfo>
              </StatCard>
            </StatsGrid>

            {/* Demand Products Section */}
            <Section>
              <SectionHeader>
                <h2>High Demand Products</h2>
              </SectionHeader>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Product</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Price</TableHeader>
                    <TableHeader>Sales</TableHeader>
                    <TableHeader>Revenue</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {demandProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category?.name || product.category}</TableCell>
                      <TableCell>Rs.{product.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{product.sales?.totalSold || 0}</TableCell>
                      <TableCell>Rs.{product.sales?.revenue?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Section>
              <SectionHeader>
                <h2>Recent Orders</h2>
                <SearchBar>
                  <SearchInput placeholder="Search orders..." />
                  <FiSearch />
                </SearchBar>
              </SectionHeader>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Order ID</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Products</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id?.substring(0, 8) || 'N/A'}</TableCell>
                      <TableCell>{order.customer?.firstName} {order.customer?.lastName}</TableCell>
                      <TableCell>
                        {order.items?.map((item, index) => (
                          <div key={index}>
                            {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>Rs.{(order.pricing?.total || order.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusBadge className={order.status || 'pending'}>
                          {order.status || 'pending'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButton onClick={() => handleViewOrder(order)}>
                          <FiEye />
                        </ActionButton>
                        <ActionButton onClick={() => handleEditOrder(order)}>
                          <FiEdit />
                        </ActionButton>
                        <ActionButton className="delete" onClick={() => handleDeleteOrder(order)}>
                          <FiTrash2 />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          </>
        )}

        {activeSection === 'pending-approvals' && (
          <Section>
            <SectionHeader>
              <h2>Products Pending Approval ({pendingProducts.length})</h2>
              <SearchBar>
                <SearchInput placeholder="Search pending products..." />
                <FiSearch />
              </SearchBar>
            </SectionHeader>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Seller</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Submitted</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {pendingProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <strong>{product.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.85em', color: 'var(--gray)' }}>
                        {product.description?.substring(0, 100)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.seller?.sellerProfile?.businessName || 
                       `${product.seller?.firstName} ${product.seller?.lastName}`}
                      <br />
                      <span style={{ fontSize: '0.85em', color: 'var(--gray)' }}>
                        {product.seller?.email}
                      </span>
                    </TableCell>
                    <TableCell>{product.category?.name || product.category}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                      <br />
                      <span style={{ fontSize: '0.85em', color: 'var(--gray)' }}>
                        {new Date(product.createdAt).toLocaleTimeString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActionButton 
                        style={{ 
                          background: '#28a745', 
                          color: 'white', 
                          marginRight: '8px',
                          border: 'none',
                          minWidth: '40px',
                          height: '36px'
                        }}
                        onClick={() => handleApproveProduct(product)}
                        title="Approve Product"
                      >
                        <FiCheck />
                      </ActionButton>
                      <ActionButton 
                        style={{ 
                          background: '#dc3545', 
                          color: 'white', 
                          marginRight: '8px',
                          border: 'none',
                          minWidth: '40px',
                          height: '36px'
                        }}
                        onClick={() => handleRejectProduct(product)}
                        title="Reject Product"
                      >
                        <FiXCircle />
                      </ActionButton>
                      <ActionButton 
                        style={{ 
                          background: '#007bff', 
                          color: 'white',
                          border: 'none',
                          minWidth: '40px',
                          height: '36px'
                        }}
                        onClick={() => handleViewProduct(product)} 
                        title="View Product"
                      >
                        <FiEye />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                      <p style={{ color: 'var(--gray)' }}>No products pending approval</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Section>
        )}

        {activeSection === 'products' && (
          <Section>
            <SectionHeader>
              <h2>All Products</h2>
              <SearchBar>
                <SearchInput placeholder="Search products..." />
                <FiSearch />
              </SearchBar>
            </SectionHeader>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name || product.category}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <StatusBadge className={product.status || 'pending'}>
                        {product.status || 'pending'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleViewProduct(product)}>
                        <FiEye />
                      </ActionButton>
                      <ActionButton onClick={() => handleEditProduct(product)}>
                        <FiEdit />
                      </ActionButton>
                      <ActionButton className="delete" onClick={() => handleDeleteProduct(product)}>
                        <FiTrash2 />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}

        {activeSection === 'users' && (
          <Section>
            <SectionHeader>
              <h2>All Users</h2>
              <SearchBar>
                <SearchInput placeholder="Search users..." />
                <FiSearch />
              </SearchBar>
            </SectionHeader>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <StatusBadge className={user.isActive ? 'confirmed' : 'pending'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleViewUser(user)}>
                        <FiEye />
                      </ActionButton>
                      <ActionButton onClick={() => handleEditUser(user)}>
                        <FiEdit />
                      </ActionButton>
                      <ActionButton className="delete" onClick={() => handleDeleteUser(user)}>
                        <FiTrash2 />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}

        {activeSection === 'orders' && (
          <Section>
            <SectionHeader>
              <h2>All Orders</h2>
              <SearchBar>
                <SearchInput placeholder="Search orders..." />
                <FiSearch />
              </SearchBar>
            </SectionHeader>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Order ID</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Products</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id?.substring(0, 8) || 'N/A'}</TableCell>
                    <TableCell>{order.customer?.firstName} {order.customer?.lastName}</TableCell>
                    <TableCell>
                      {order.items?.map((item, index) => (
                        <div key={index}>
                          {item.name} (x{item.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>${(order.pricing?.total || order.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge className={order.status || 'pending'}>
                        {order.status || 'pending'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleViewOrder(order)}>
                        <FiEye />
                      </ActionButton>
                      <ActionButton onClick={() => handleEditOrder(order)}>
                        <FiEdit />
                      </ActionButton>
                      <ActionButton className="delete" onClick={() => handleDeleteOrder(order)}>
                        <FiTrash2 />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}
      </MainContent>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <Modal onClick={() => setShowProductModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Product Details</h2>
              <CloseButton onClick={() => setShowProductModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <ProductImageModal>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0].url} 
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ) : (
                  '🎁'
                )}
              </ProductImageModal>
              
              <ProductDetailGrid>
                <ProductDetailItem>
                  <h4>Product Name</h4>
                  <p>{selectedProduct.name}</p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Description</h4>
                  <p>{selectedProduct.description}</p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Price</h4>
                  <p>Rs.{selectedProduct.price?.toFixed(2) || '0.00'}</p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Category</h4>
                  <p>{selectedProduct.category?.name || selectedProduct.category}</p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Seller</h4>
                  <p>
                    {selectedProduct.seller?.sellerProfile?.businessName || 
                     `${selectedProduct.seller?.firstName} ${selectedProduct.seller?.lastName}`}
                    <br />
                    <span style={{ fontSize: '0.9em', color: 'var(--gray)' }}>
                      {selectedProduct.seller?.email}
                    </span>
                  </p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Approval Status</h4>
                  <p style={{ 
                    color: selectedProduct.approvalStatus === 'pending' ? '#856404' : 
                           selectedProduct.approvalStatus === 'approved' ? '#155724' : '#721c24'
                  }}>
                    {selectedProduct.approvalStatus?.toUpperCase() || 'PENDING'}
                  </p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Inventory</h4>
                  <p>{selectedProduct.inventory?.quantity || selectedProduct.quantity || 0} units</p>
                </ProductDetailItem>
                
                <ProductDetailItem>
                  <h4>Submitted Date</h4>
                  <p>{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                </ProductDetailItem>
                
                {selectedProduct.rejectionReason && (
                  <ProductDetailItem>
                    <h4>Rejection Reason</h4>
                    <p style={{ color: '#721c24' }}>{selectedProduct.rejectionReason}</p>
                  </ProductDetailItem>
                )}
              </ProductDetailGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;