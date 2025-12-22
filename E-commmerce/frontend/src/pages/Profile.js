import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

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

const Profile = () => {
  const { user, loading } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const email = user?.email || 'Not provided';
  const phone = user?.phone || 'Not added';
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return firstName[0].toUpperCase();
  };

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

  return (
    <ProfileContainer>
      <div className="container">
        <ProfileHeader>
          <HeaderContent>
            <AvatarWrapper>{getInitials()}</AvatarWrapper>
            <HeaderText>
              <h1>Welcome back, {firstName}! 👋</h1>
              <p>Manage your profile, addresses, and account settings</p>
            </HeaderText>
          </HeaderContent>
        </ProfileHeader>

        <ProfileGrid>
          <CardBox onClick={() => setSelectedCard('personal')} className={selectedCard === 'personal' ? 'selected' : ''}>
            <h3><span>👤</span> Personal Info</h3>
            <p>View and update your personal information including name and email address</p>
          </CardBox>
          <CardBox onClick={() => setSelectedCard('addresses')} className={selectedCard === 'addresses' ? 'selected' : ''}>
            <h3><span>📍</span> Addresses</h3>
            <p>Manage your shipping and billing addresses for faster checkout</p>
          </CardBox>
          <CardBox onClick={() => setSelectedCard('security')} className={selectedCard === 'security' ? 'selected' : ''}>
            <h3><span>🔒</span> Security</h3>
            <p>Update your password and manage your account security settings</p>
          </CardBox>
        </ProfileGrid>

        <InfoSection>
          <h2>Account Information</h2>
          <InfoGrid>
            <InfoItem>
              <label>Full Name</label>
              <span>{user?.firstName} {user?.lastName || ''}</span>
            </InfoItem>
            <InfoItem>
              <label>Email Address</label>
              <span>{email}</span>
            </InfoItem>
            <InfoItem>
              <label>Phone Number</label>
              <span>{phone}</span>
            </InfoItem>
            <InfoItem>
              <label>Member Since</label>
              <span>{joinDate}</span>
            </InfoItem>
          </InfoGrid>
        </InfoSection>

        <InfoSection>
          <h2>Account Status</h2>
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
          </InfoGrid>
        </InfoSection>
      </div>
    </ProfileContainer>
  );
};

export default Profile;
