import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  padding: var(--spacing-3xl) 0;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  h1 {
    font-size: 6rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
  }
  
  h2 {
    margin-bottom: var(--spacing-lg);
    color: var(--dark-gray);
  }
  
  p {
    margin-bottom: var(--spacing-xl);
    color: var(--gray);
  }
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background: var(--primary-color);
  color: var(--white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <div className="container">
        <Content>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <HomeButton to="/">Go Home</HomeButton>
        </Content>
      </div>
    </NotFoundContainer>
  );
};

export default NotFound;
