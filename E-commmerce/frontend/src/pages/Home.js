import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiHeart, FiShield, FiTruck } from 'react-icons/fi';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
  padding: var(--spacing-3xl) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-xl);
  margin-bottom: var(--spacing-2xl);
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--accent-color);
  color: var(--white);
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-lg);
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--accent-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const FeaturesSection = styled.section`
  padding: var(--spacing-3xl) 0;
  background: var(--light-gray);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-2xl);
`;

const FeatureCard = styled(motion.div)`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  font-size: var(--font-xl);
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: var(--font-3xl);
  color: var(--dark-gray);
  margin-bottom: var(--spacing-md);
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: var(--gray);
  font-size: var(--font-lg);
  max-width: 600px;
  margin: 0 auto;
`;

const CategoriesSection = styled.section`
  padding: var(--spacing-3xl) 0;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
`;

const CategoryCard = styled(motion(Link))`
  display: block;
  background: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  text-decoration: none;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const CategoryImage = styled.div`
  height: 200px;
  background: linear-gradient(45deg, var(--primary-light), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const CategoryContent = styled.div`
  padding: var(--spacing-lg);
  text-align: center;
`;

const CategoryName = styled.h3`
  color: var(--dark-gray);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-lg);
`;

const CategoryCount = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
`;

const TestimonialsSection = styled.section`
  padding: var(--spacing-3xl) 0;
  background: var(--light-gray);
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
`;

const TestimonialCard = styled(motion.div)`
  background: var(--white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const TestimonialText = styled.p`
  font-style: italic;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  color: var(--dark-gray);
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 600;
`;

const AuthorInfo = styled.div`
  h4 {
    margin: 0;
    color: var(--dark-gray);
  }
  
  p {
    margin: 0;
    color: var(--gray);
    font-size: var(--font-sm);
  }
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: var(--spacing-sm);
  color: var(--accent-color);
`;

const Home = () => {
  const features = [
    {
      icon: <FiHeart />,
      title: "Handcrafted with Love",
      description: "Every item is carefully crafted by skilled artisans with passion and attention to detail."
    },
    {
      icon: <FiShield />,
      title: "Quality Guaranteed",
      description: "We ensure every product meets our high standards for quality and craftsmanship."
    },
    {
      icon: <FiTruck />,
      title: "Fast & Secure Shipping",
      description: "Your handmade treasures are carefully packaged and shipped with tracking."
    },
    {
      icon: <FiStar />,
      title: "Support Artisans",
      description: "Your purchase directly supports independent creators and their craft."
    }
  ];

  const categories = [
    { name: "Jewelry", count: "items", emoji: "💎" },
    { name: "Home Decor", count: "items", emoji: "🏠" },
    { name: "Art & Prints", count: "items", emoji: "🎨" },
    { name: "Clothing", count: "items", emoji: "👗" },
    { name: "Pottery", count: "items", emoji: "🏺" },
    { name: "Woodwork", count: "items", emoji: "🪵" }
  ];

  const testimonials = [
    {
      text: "I found the most beautiful handmade necklace on Craftify. The quality is amazing and the seller was so helpful!",
      author: "Sarah Johnson",
      role: "Happy Customer",
      rating: 5
    },
    {
      text: "As an artisan, Craftify has helped me reach customers worldwide. The platform is easy to use and very supportive.",
      author: "Michael Chen",
      role: "Pottery Artist",
      rating: 5
    },
    {
      text: "The home decor items I bought transformed my living space. Each piece tells a story and adds character to my home.",
      author: "Emma Davis",
      role: "Interior Designer",
      rating: 5
    }
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <div className="container">
          <HeroContent>
            <HeroTitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Discover Unique Handmade Treasures
            </HeroTitle>
            <HeroSubtitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Connect with talented artisans and find one-of-a-kind pieces that tell a story
            </HeroSubtitle>
            <CTAButton
              to="/products"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Now <FiArrowRight />
            </CTAButton>
          </HeroContent>
        </div>
      </HeroSection>

      <FeaturesSection>
        <div className="container">
          <SectionTitle>Why Choose Craftify?</SectionTitle>
          <SectionSubtitle>
            We're more than just a marketplace - we're a community celebrating creativity and craftsmanship
          </SectionSubtitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </div>
      </FeaturesSection>

      <CategoriesSection>
        <div className="container">
          <SectionTitle>Explore Categories</SectionTitle>
          <SectionSubtitle>
            Discover amazing handcrafted items across various categories
          </SectionSubtitle>
          <CategoriesGrid>
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                to={`/products?category=${category.name.toLowerCase()}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CategoryImage>
                  {category.emoji}
                </CategoryImage>
                <CategoryContent>
                  <CategoryName>{category.name}</CategoryName>
                  <CategoryCount>{category.count}</CategoryCount>
                </CategoryContent>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </div>
      </CategoriesSection>

      <TestimonialsSection>
        
      </TestimonialsSection>
    </HomeContainer>
  );
};

export default Home;
