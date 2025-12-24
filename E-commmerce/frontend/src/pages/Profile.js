import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook for managing profile form state and validation
 */
const useProfileForm = (initialUser) => {
  const [formData, setFormData] = useState({
    firstName: initialUser?.firstName || '',
    lastName: initialUser?.lastName || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: initialUser?.firstName || '',
      lastName: initialUser?.lastName || '',
      email: initialUser?.email || '',
      phone: initialUser?.phone || '',
    });
  };

  return { formData, setFormData, handleInputChange, resetForm };
};

/**
 * Hook for handling profile updates
 */
const useProfileUpdate = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (formData) => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('First name and last name are required');
      return false;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return {
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    validateForm,
    clearMessages,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateProfileCompletion = (user) => {
  let completionCount = 0;
  const totalFields = 4;

  if (user?.firstName) completionCount++;
  if (user?.lastName) completionCount++;
  if (user?.email) completionCount++;
  if (user?.phone) completionCount++;

  return Math.round((completionCount / totalFields) * 100);
};

const getAccountAgeDays = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const today = new Date();
  return Math.floor((today - created) / (1000 * 60 * 60 * 24));
};

const formatLastUpdated = (date) => {
  if (!date) return 'Never';
  const now = new Date();
  const updated = new Date(date);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  
  return updated.toLocaleDateString();
};

// ============================================================================
// STYLED COMPONENTS - LAYOUT
// ============================================================================

const ProfileContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0e8e0 100%);
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: var(--white);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-3xl);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, -20px); }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
`;

const AvatarWrapper = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--secondary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 4px solid var(--white);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;

  h1 {
    font-family: var(--font-secondary);
    font-size: var(--font-4xl);
    margin-bottom: var(--spacing-sm);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: var(--font-lg);
    opacity: 0.95;
    margin: 0;
  }
`;

// ============================================================================
// STYLED COMPONENTS - CARDS & SECTIONS
// ============================================================================

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);
`;

const CardBox = styled.div`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border-left: 5px solid var(--accent-color);
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-left-color: var(--primary-color);
  }

  h3 {
    color: var(--primary-color);
    font-family: var(--font-secondary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    span {
      font-size: 1.5rem;
    }
  }

  p {
    color: var(--gray);
    margin: 0;
    line-height: 1.8;
  }
`;

const InfoSection = styled.div`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-2xl);

  h2 {
    color: var(--primary-color);
    font-family: var(--font-secondary);
    margin-bottom: var(--spacing-xl);
    font-size: var(--font-2xl);
    border-bottom: 2px solid var(--accent-light);
    padding-bottom: var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
`;

const InfoItem = styled.div`
  padding: var(--spacing-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);

  &:hover {
    background: var(--accent-light);
    transform: translateX(5px);
  }

  label {
    display: block;
    color: var(--gray);
    font-size: var(--font-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
  }

  span {
    display: block;
    color: var(--black);
    font-size: var(--font-lg);
    font-weight: 500;
  }
`;

// ============================================================================
// STYLED COMPONENTS - FORMS
// ============================================================================

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const Label = styled.label`
  display: block;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--light-gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: var(--font-primary);
  transition: all var(--transition-normal);
  background: var(--white);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
  }

  &:disabled {
    background: var(--light-gray);
    cursor: not-allowed;
  }
`;

// ============================================================================
// STYLED COMPONENTS - BUTTONS & MESSAGES
// ============================================================================

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const Button = styled.button`
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: var(--white);
  box-shadow: var(--shadow-md);

  &:hover {
    box-shadow: var(--shadow-lg);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: var(--light-gray);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);

  &:hover {
    background: var(--primary-color);
    color: var(--white);
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 2px solid var(--success);
  color: #155724;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 2px solid var(--error);
  color: #721c24;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  animation: slideIn 0.3s ease-out;
`;

// ============================================================================
// STYLED COMPONENTS - PROGRESS & STATS
// ============================================================================

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--light-gray);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin: var(--spacing-md) 0;

  div {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    border-radius: var(--radius-full);
    transition: width 0.5s ease;
    width: ${props => props.percentage || 0}%;
  }
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, ${props => props.bgColor || 'var(--primary-color)'}, ${props => props.bgColorLight || 'var(--primary-light)'});
  color: var(--white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  .stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-lg);
  }

  .stat-content {
    flex: 1;

    .stat-label {
      font-size: var(--font-sm);
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--spacing-xs);
    }

    .stat-value {
      font-size: var(--font-2xl);
      font-weight: 700;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
`;

const CompletionWidget = styled.div`
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-2xl);
  border: 2px solid var(--accent-light);

  .completion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    h3 {
      color: var(--primary-color);
      margin: 0;
      font-size: var(--font-lg);
    }

    .percentage {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: var(--white);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: var(--font-sm);
    }
  }

  .completion-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);

    .item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-sm);

      span {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
      }

      .completed {
        background: var(--success);
        color: var(--white);
      }

      .pending {
        background: var(--light-gray);
        color: var(--gray);
      }
    }
  }
`;

const TimeStampText = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
  margin: var(--spacing-md) 0 0 0;
  font-style: italic;
`;

// ============================================================================
// STYLED COMPONENTS - LOADING STATE
// ============================================================================

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  div {
    width: 50px;
    height: 50px;
    border: 4px solid var(--light-gray);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Profile = () => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const { user, loading } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const { 
    formData, 
    handleInputChange, 
    resetForm 
  } = useProfileForm(user);
  const {
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    validateForm,
    clearMessages,
  } = useProfileUpdate();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const email = user?.email || 'Not provided';
  const phone = user?.phone || 'Not added';
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
  const profileCompletion = useMemo(() => calculateProfileCompletion(user), [user]);
  const accountAgeDays = useMemo(() => getAccountAgeDays(user?.createdAt), [user?.createdAt]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return firstName[0].toUpperCase();
  };

  // ========================================================================
  // EVENT HANDLERS - FORM ACTIONS
  // ========================================================================

  const handleCancel = () => {
    resetForm();
    setIsEditingPersonal(false);
    clearMessages();
  };

  // ========================================================================
  // EVENT HANDLERS - PROFILE UPDATE
  // ========================================================================

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validate Form
    if (!validateForm(formData)) {
      return;
    }

    // Check: Authentication Token
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Please login first to update your profile');
      return;
    }

    // Execute: API Call
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'Failed to update profile');
      }

      // Success: Update State
      setSuccessMessage('Personal details updated successfully! 🎉');
      setIsEditingPersonal(false);

      if (data.data) {
        // Form will auto-update through resetForm call
      }

      // Auto-clear success message
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Failed to update personal details. Please try again.');
    }
  };

  // ========================================================================
  // RENDER - LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <ProfileContainer>
        <div className="container">
          <LoadingSpinner>
            <div></div>
          </LoadingSpinner>
        </div>
      </ProfileContainer>
    );
  }

  // ========================================================================
  // RENDER - HELPER COMPONENTS
  // ========================================================================

  const ProfileCompletionSection = () => (
    <CompletionWidget>
      <div className="completion-header">
        <h3>📋 Profile Completion</h3>
        <div className="percentage">{profileCompletion}%</div>
      </div>
      <ProgressBar percentage={profileCompletion}>
        <div />
      </ProgressBar>
      <div className="completion-items">
        <div className="item">
          <span className={user?.firstName ? 'completed' : 'pending'}>
            {user?.firstName ? '✓' : '○'}
          </span>
          First Name
        </div>
        <div className="item">
          <span className={user?.lastName ? 'completed' : 'pending'}>
            {user?.lastName ? '✓' : '○'}
          </span>
          Last Name
        </div>
        <div className="item">
          <span className={user?.email ? 'completed' : 'pending'}>
            {user?.email ? '✓' : '○'}
          </span>
          Email
        </div>
        <div className="item">
          <span className={user?.phone ? 'completed' : 'pending'}>
            {user?.phone ? '✓' : '○'}
          </span>
          Phone
        </div>
      </div>
    </CompletionWidget>
  );

  const StatsSection = () => (
    <StatsGrid>
      <StatsCard bgColor="var(--primary-color)" bgColorLight="var(--primary-light)">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <div className="stat-label">Account Age</div>
          <div className="stat-value">{accountAgeDays} days</div>
        </div>
      </StatsCard>

      <StatsCard bgColor="#4CAF50" bgColorLight="#66BB6A">
        <div className="stat-icon">✓</div>
        <div className="stat-content">
          <div className="stat-label">Account Status</div>
          <div className="stat-value">Active</div>
        </div>
      </StatsCard>

      <StatsCard bgColor="#2196F3" bgColorLight="#42A5F5">
        <div className="stat-icon">👤</div>
        <div className="stat-content">
          <div className="stat-label">Account Type</div>
          <div className="stat-value" style={{ textTransform: 'capitalize' }}>
            {user?.role || 'Customer'}
          </div>
        </div>
      </StatsCard>
    </StatsGrid>
  );

  // ========================================================================
  // RENDER - MAIN CONTENT
  // ========================================================================

  return (
    <ProfileContainer>
      <div className="container">
        {/* HEADER SECTION */}
        <ProfileHeader>
          <HeaderContent>
            <AvatarWrapper>{getInitials()}</AvatarWrapper>
            <HeaderText>
              <h1>Welcome back, {firstName}! 👋</h1>
              <p>Manage your profile, addresses, and account settings</p>
            </HeaderText>
          </HeaderContent>
        </ProfileHeader>

        {/* NAVIGATION CARDS */}
        <ProfileGrid>
          <CardBox 
            onClick={() => setSelectedCard('personal')} 
            className={selectedCard === 'personal' ? 'selected' : ''}
          >
            <h3><span>👤</span> Personal Info</h3>
            <p>View and update your personal information including name and email address</p>
          </CardBox>

          <CardBox 
            onClick={() => setSelectedCard('addresses')} 
            className={selectedCard === 'addresses' ? 'selected' : ''}
          >
            <h3><span>📍</span> Addresses</h3>
            <p>Manage your shipping and billing addresses for faster checkout</p>
          </CardBox>

          <CardBox 
            onClick={() => setSelectedCard('security')} 
            className={selectedCard === 'security' ? 'selected' : ''}
          >
            <h3><span>🔒</span> Security</h3>
            <p>Update your password and manage your account security settings</p>
          </CardBox>
        </ProfileGrid>

        {/* STATS SECTION */}
        <StatsSection />

        {/* PROFILE COMPLETION */}
        <ProfileCompletionSection />

        {/* ACCOUNT INFORMATION SECTION */}
        <InfoSection>
          <h2>
            Account Information
            <span 
              onClick={() => setIsEditingPersonal(!isEditingPersonal)} 
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            >
              {isEditingPersonal ? '✕' : '✎'}
            </span>
          </h2>

          {successMessage && <SuccessMessage>✓ {successMessage}</SuccessMessage>}
          {errorMessage && <ErrorMessage>⚠ {errorMessage}</ErrorMessage>}

          {isEditingPersonal ? (
            // EDIT MODE
            <form onSubmit={handleSavePersonal}>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </FormGroup>
              </FormGrid>

              <ButtonGroup>
                <PrimaryButton type="submit">💾 Save Changes</PrimaryButton>
                <SecondaryButton type="button" onClick={handleCancel}>✕ Cancel</SecondaryButton>
              </ButtonGroup>
            </form>
          ) : (
            // VIEW MODE
            <InfoGrid>
              <InfoItem>
                <label>First Name</label>
                <span>{user?.firstName || 'Not provided'}</span>
              </InfoItem>

              <InfoItem>
                <label>Last Name</label>
                <span>{user?.lastName || 'Not provided'}</span>
              </InfoItem>

              <InfoItem>
                <label>Email Address</label>
                <span>{email}</span>
              </InfoItem>

              <InfoItem>
                <label>Phone Number</label>
                <span>{phone}</span>
              </InfoItem>
            </InfoGrid>
          )}
        </InfoSection>

        {/* ACCOUNT STATUS SECTION */}
        <InfoSection>
          <h2>Account Status & Timeline</h2>

          <InfoGrid>
            <InfoItem>
              <label>Account Status</label>
              <span style={{ color: 'var(--success)' }}>✓ Active</span>
            </InfoItem>

            <InfoItem>
              <label>Email Verification</label>
              <span style={{ color: 'var(--success)' }}>✓ Verified</span>
            </InfoItem>

            <InfoItem>
              <label>Account Type</label>
              <span style={{ textTransform: 'capitalize' }}>{user?.role || 'Customer'}</span>
            </InfoItem>

            <InfoItem>
              <label>Member Since</label>
              <span>{joinDate}</span>
            </InfoItem>
          </InfoGrid>
          
          <TimeStampText>
            Last updated: {formatLastUpdated(user?.updatedAt)}
          </TimeStampText>
        </InfoSection>
      </div>
    </ProfileContainer>
  );
};

export default Profile;
