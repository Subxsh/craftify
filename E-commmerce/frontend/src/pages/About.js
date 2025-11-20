import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  padding: var(--spacing-2xl) 0;
  min-height: 60vh;
`;

const About = () => {
  return (
    <AboutContainer>
      <div className="container">
        <h1>About Craftify</h1>
        <p>Learn more about our mission to support artisans worldwide.</p>
      </div>
    </AboutContainer>
  );
};

export default About;
