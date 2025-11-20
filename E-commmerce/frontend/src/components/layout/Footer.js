import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: var(--dark-gray);
  color: var(--white);
  margin-top: auto;
`;

const FooterContent = styled.div`
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
`;

const FooterSection = styled.div`
  h3 {
    color: var(--white);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-lg);
    font-weight: 600;
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: var(--light-gray);
  text-decoration: none;
  margin-bottom: var(--spacing-sm);
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--accent-color);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--light-gray);
  
  svg {
    color: var(--accent-color);
    flex-shrink: 0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--accent-color);
    transform: translateY(-2px);
  }
`;

const Newsletter = styled.div`
  h3 {
    margin-bottom: var(--spacing-md);
  }
  
  p {
    color: var(--light-gray);
    margin-bottom: var(--spacing-lg);
    line-height: 1.6;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--dark-gray);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const NewsletterButton = styled.button`
  background: var(--accent-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: var(--accent-dark);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid var(--gray);
  padding: var(--spacing-lg) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: var(--light-gray);
  margin: 0;
`;

const PaymentMethods = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
`;

const PaymentIcon = styled.div`
  background: var(--white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--dark-gray);
`;

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription');
  };

  return (
    <FooterContainer>
      <div className="container">
        <FooterContent>
          <FooterGrid>
            <FooterSection>
              <h3>About Craftify</h3>
              <p style={{ color: 'var(--light-gray)', lineHeight: '1.6', marginBottom: 'var(--spacing-lg)' }}>
                Discover unique, handcrafted treasures from talented artisans around the world. 
                Every purchase supports independent creators and their craft.
              </p>
              <SocialLinks>
                <SocialLink href="#" aria-label="Facebook">
                  <FiFacebook />
                </SocialLink>
                <SocialLink href="#" aria-label="Instagram">
                  <FiInstagram />
                </SocialLink>
                <SocialLink href="#" aria-label="Twitter">
                  <FiTwitter />
                </SocialLink>
              </SocialLinks>
            </FooterSection>

            <FooterSection>
              <h3>Quick Links</h3>
              <FooterLink to="/products">Browse Products</FooterLink>
              <FooterLink to="/categories">Categories</FooterLink>
              <FooterLink to="/sellers">Featured Sellers</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
            </FooterSection>

            <FooterSection>
              <h3>Customer Service</h3>
              <FooterLink to="/help">Help Center</FooterLink>
              <FooterLink to="/shipping">Shipping Info</FooterLink>
              <FooterLink to="/returns">Returns & Exchanges</FooterLink>
              <FooterLink to="/size-guide">Size Guide</FooterLink>
              <FooterLink to="/track-order">Track Your Order</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
            </FooterSection>

            <FooterSection>
              <h3>Sell on Craftify</h3>
              <FooterLink to="/sell">Start Selling</FooterLink>
              <FooterLink to="/seller-guide">Seller Guide</FooterLink>
              <FooterLink to="/seller-policies">Seller Policies</FooterLink>
              <FooterLink to="/seller-fees">Fees & Payments</FooterLink>
              <FooterLink to="/seller-support">Seller Support</FooterLink>
            </FooterSection>

            <FooterSection>
              <Newsletter>
                <h3>Stay Connected</h3>
                <p>Get the latest updates on new products and exclusive offers.</p>
                <NewsletterForm onSubmit={handleNewsletterSubmit}>
                  <NewsletterInput
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                  <NewsletterButton type="submit">
                    Subscribe
                  </NewsletterButton>
                </NewsletterForm>
              </Newsletter>
            </FooterSection>

            <FooterSection>
              <h3>Contact Us</h3>
              <ContactInfo>
                <FiMail />
                <span>support@craftify.com</span>
              </ContactInfo>
              <ContactInfo>
                <FiPhone />
                <span>1-800-CRAFTIFY</span>
              </ContactInfo>
              <ContactInfo>
                <FiMapPin />
                <span>123 Artisan Street, Creative City, CC 12345</span>
              </ContactInfo>
            </FooterSection>
          </FooterGrid>

          <FooterBottom>
            <Copyright>
              © 2024 Craftify. All rights reserved. | 
              <FooterLink to="/privacy" style={{ display: 'inline', marginLeft: 'var(--spacing-sm)' }}>
                Privacy Policy
              </FooterLink> | 
              <FooterLink to="/terms" style={{ display: 'inline', marginLeft: 'var(--spacing-sm)' }}>
                Terms of Service
              </FooterLink>
            </Copyright>
            
            <PaymentMethods>
              <span style={{ color: 'var(--light-gray)', marginRight: 'var(--spacing-sm)' }}>
                We accept:
              </span>
              <PaymentIcon>VISA</PaymentIcon>
              <PaymentIcon>MC</PaymentIcon>
              <PaymentIcon>AMEX</PaymentIcon>
              <PaymentIcon>PayPal</PaymentIcon>
            </PaymentMethods>
          </FooterBottom>
        </FooterContent>
      </div>
    </FooterContainer>
  );
};

export default Footer;
