import React from 'react';
import styled from 'styled-components';

const ContactContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
`;

const Contact = () => {
  return (
    <ContactContainer>
      <div className="container">
        <h1>Contact Us</h1>
        <p>Get in touch with our support team.</p>
      </div>
    </ContactContainer>
  );
};

export default Contact;
