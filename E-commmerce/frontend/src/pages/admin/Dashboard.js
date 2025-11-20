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
  FiBarChart2, 
  FiSettings,
  FiLogOut,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTruck,
  FiUser,
  FiTag,
  FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import userService from '../../services/userService';
import orderService from '../../services/orderService';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: var(--light-gray);
  padding: var(--spacing-xl) 0;
`;

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  width: 280px;
  background: var(--white);
  border-right: 1px solid var(--light-gray);
  padding: var(--spacing-xl) 0;
  overflow-y: auto;
  z-index: 100;
`;

const SidebarItem = styled.div`
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--dark-gray)'};
  background: ${props => props.active ? 'var(--primary-light)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background: var(--light-gray);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const MainContent = styled.div`
  margin-left: 280px;
  padding: 0 var(--spacing-2xl);
`;

const Header = styled.div`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WelcomeSection = styled.div`
  h1 {
    color: var(--dark-gray);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--gray);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--danger-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;
  
  &:hover {
    background: var(--danger-dark);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const StatCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: ${props => props.color || 'var(--primary-light)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || 'var(--primary-color)'};
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--dark-gray);
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  color: var(--gray);
  font-size: var(--font-sm);
`;

const Section = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    color: var(--dark-gray);
    margin: 0;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const SearchInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--light-gray);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  width: 250px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: var(--light-gray);
`;

const TableHeader = styled.th`
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  border-bottom: 1px solid var(--light-gray);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--light-gray);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: var(--light-gray);
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-lg) var(--spacing-xl);
  color: var(--dark-gray);
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--light-gray);
  background: var(--white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray);
  margin-right: var(--spacing-sm);
  
  &:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }
  
  &.delete:hover {
    background: var(--danger-color);
    border-color: var(--danger-color);
  }
  
  &.edit:hover {
    background: var(--warning-color);
    border-color: var(--warning-color);
  }
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 600;
  text-transform: uppercase;
  
  &.pending {
    background: var(--warning-light);
    color: var(--warning-dark);
  }
  
  &.confirmed {
    background: var(--info-light);
    color: var(--info-dark);
  }
  
  &.processing {
    background: var(--primary-light);
    color: var(--primary-color);
  }
  
  &.shipped {
    background: var(--secondary-light);
    color: var(--secondary-color);
  }
  
  &.delivered {
    background: var(--success-light);
    color: var(--success-dark);
  }
  
  &.cancelled {
    background: var(--danger-light);
    color: var(--danger-dark);
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [demandProducts, setDemandProducts] = useState([]); // New state for demand products
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsData, usersData, ordersData] = await Promise.all([
        productService.getAllProducts(),
        userService.getAllUsers(),
        orderService.getAllOrders()
      ]);
      
      console.log('Products data received:', productsData);
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

  // Product actions
  const handleViewProduct = (product) => {
    console.log('View product:', product);
    // Navigate to the product detail page
    navigate(`/product/${product._id}`);
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
                  <StatValue>${stats.totalRevenue}</StatValue>
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
                      <TableCell>${product.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{product.sales?.totalSold || 0}</TableCell>
                      <TableCell>${product.sales?.revenue?.toFixed(2) || '0.00'}</TableCell>
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
          </>
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
    </DashboardContainer>
  );
};

export default Dashboard;