import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
`;

const Profile = () => {
  const { user, loading } = useAuth();

  const firstName = user?.firstName || user?.name || user?.email || '';

  return (
    <ProfileContainer>
      <div className="container">
        <h1>My Profile</h1>
        {!loading ? (
          <>
            <h2>Welcome back{firstName ? `, ${firstName}` : ''}!</h2>
            <p>Manage your profile information, addresses, and account settings here.</p>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </ProfileContainer>
  );
};

export default Profile;
