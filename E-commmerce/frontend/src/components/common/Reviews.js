import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiStar, FiThumbsUp, FiThumbsDown, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';

const ReviewsContainer = styled.div`
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-3xl);
  border-top: 2px solid var(--light-gray);
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h2`
  color: var(--dark-gray);
  font-size: var(--font-2xl);
  margin: 0;
`;

const SortSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: var(--white);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const ReviewCard = styled(motion.div)`
  background: var(--white);
  border: 1px solid var(--light-gray);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const ReviewerAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const ReviewerDetails = styled.div`
  h4 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--dark-gray);
    font-size: var(--font-base);
  }

  p {
    margin: 0;
    color: var(--gray);
    font-size: var(--font-sm);
  }
`;

const ReviewActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-lg);
  transition: color var(--transition-fast);

  &:hover {
    color: var(--primary-color);
  }

  &.delete:hover {
    color: #dc3545;
  }
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);

  svg {
    color: var(--accent-color);
  }
`;

const ReviewTitle = styled.h4`
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--dark-gray);
  font-size: var(--font-lg);
`;

const ReviewComment = styled.p`
  color: var(--gray);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg) 0;
`;

const ReviewFooter = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--light-gray);
`;

const HelpfulButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const HelpfulButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--light-gray);
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  color: var(--gray);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--primary-light);
    color: var(--primary-color);
  }
`;

const SellerResponse = styled.div`
  background: var(--light-gray);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
  border-left: 4px solid var(--primary-color);
`;

const SellerResponseLabel = styled.p`
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 600;
  color: var(--primary-color);
  font-size: var(--font-sm);
`;

const SellerResponseText = styled.p`
  margin: 0;
  color: var(--dark-gray);
  font-size: var(--font-sm);
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray);

  p {
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray);
`;

const Reviews = ({ productId, onWriteReview }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId, page, 10, sortBy);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(reviewId, token);
        setReviews(reviews.filter(r => r._id !== reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      setReviews(reviews.map(r => 
        r._id === reviewId 
          ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleUnhelpful = async (reviewId) => {
    try {
      await reviewService.markUnhelpful(reviewId);
      setReviews(reviews.map(r => 
        r._id === reviewId 
          ? { ...r, unhelpfulCount: (r.unhelpfulCount || 0) + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error marking review as unhelpful:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={16}
            fill={i < rating ? 'currentColor' : 'none'}
            style={{ color: i < rating ? 'var(--accent-color)' : 'var(--light-gray)' }}
          />
        ))}
        <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--gray)', fontSize: 'var(--font-sm)' }}>
          {rating} out of 5
        </span>
      </>
    );
  };

  return (
    <ReviewsContainer>
      <ReviewsHeader>
        <Title>Customer Reviews</Title>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </SortSelect>
        </div>
      </ReviewsHeader>

      {loading ? (
        <LoadingState>Loading reviews...</LoadingState>
      ) : reviews.length === 0 ? (
        <EmptyState>
          <p>No reviews yet. Be the first to review this product!</p>
        </EmptyState>
      ) : (
        <ReviewsList>
          {reviews.map((review, index) => (
            <ReviewCard
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReviewHeader>
                <ReviewerInfo>
                  <ReviewerAvatar>
                    {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                  </ReviewerAvatar>
                  <ReviewerDetails>
                    <h4>{review.user?.firstName} {review.user?.lastName}</h4>
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                  </ReviewerDetails>
                </ReviewerInfo>
                {user && user._id === review.user._id && (
                  <ReviewActions>
                    <ActionButton onClick={() => onWriteReview(review)}>
                      <FiEdit2 />
                    </ActionButton>
                    <ActionButton className="delete" onClick={() => handleDelete(review._id)}>
                      <FiTrash2 />
                    </ActionButton>
                  </ReviewActions>
                )}
              </ReviewHeader>

              <RatingStars>
                {renderStars(review.rating)}
              </RatingStars>

              <ReviewTitle>{review.title}</ReviewTitle>
              <ReviewComment>{review.comment}</ReviewComment>

              {review.sellerResponse && (
                <SellerResponse>
                  <SellerResponseLabel>Seller Response</SellerResponseLabel>
                  <SellerResponseText>{review.sellerResponse.comment}</SellerResponseText>
                </SellerResponse>
              )}

              <ReviewFooter>
                <HelpfulButtons>
                  <HelpfulButton onClick={() => handleHelpful(review._id)}>
                    <FiThumbsUp /> Helpful ({review.helpfulCount || 0})
                  </HelpfulButton>
                  <HelpfulButton onClick={() => handleUnhelpful(review._id)}>
                    <FiThumbsDown /> ({review.unhelpfulCount || 0})
                  </HelpfulButton>
                </HelpfulButtons>
              </ReviewFooter>
            </ReviewCard>
          ))}
        </ReviewsList>
      )}
    </ReviewsContainer>
  );
};

export default Reviews;
