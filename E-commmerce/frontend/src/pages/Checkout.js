import React from 'react';
import styled from 'styled-components';

const CheckoutContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
`;

const Checkout = () => {
  return (
    <CheckoutContainer>
      <div className="container">
        <h1>Checkout</h1>
        <p>Secure checkout process coming soon!</p>
      </div>
    </CheckoutContainer>
  );
};

export default Checkout;
