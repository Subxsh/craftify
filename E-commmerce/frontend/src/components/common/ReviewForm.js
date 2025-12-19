import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiStar } from 'react-icons/fi';
import reviewService from '../../services/reviewService';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--dark-gray);
  font-size: var(--font-xl);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--gray);
  font-size: var(--font-xl);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--dark-gray);
  }
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--dark-gray);
  font-weight: 600;
  font-size: var(--font-sm);
`;

const RatingInput = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const StarButton = styled.button`
  background: none;
  border: none;
  color: var(--light-gray);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--accent-color);
  }

  ${props => props.active && `
    color: var(--accent-color);
  `}
`;

const TextInput = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: inherit;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: inherit;
  background: var(--white);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CharCount = styled.p`
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-xs);
  color: var(--gray);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
`;

const Button = styled.button`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-base);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(Button)`
  background: var(--primary-color);
  color: var(--white);
  border: none;

  &:hover:not(:disabled) {
    background: var(--primary-dark);
  }
`;

const CancelButton = styled(Button)`
  background: var(--light-gray);
  color: var(--dark-gray);
  border: none;

  &:hover {
    background: var(--gray);
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: var(--font-sm);
  margin: var(--spacing-sm) 0 0 0;
`;

const SuccessMessage = styled.p`
  color: #28a745;
  font-size: var(--font-sm);
  margin: var(--spacing-sm) 0 0 0;
`;

const InfoMessage = styled.p`
  color: var(--gray);
  font-size: var(--font-sm);
  margin: var(--spacing-sm) 0 0 0;
  font-style: italic;
`;

const ReviewForm = ({ 
  productId, 
  orderId: initialOrderId = null,
  onClose, 
  onSuccess, 
  initialReview = null,
  token 
}) => {
  const [orderId, setOrderId] = useState(initialOrderId || initialReview?.order || '');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [title, setTitle] = useState(initialReview?.title || '');
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(!initialReview && !initialOrderId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!initialReview && !initialOrderId) {
      fetchPendingReviews();
    }
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setFetchingOrders(true);
      const data = await reviewService.getPendingReviews(token);
      
      // Filter for current product
      const currentProductReviews = data.filter(r => r.product === productId);
      setPendingReviews(currentProductReviews);
      
      if (currentProductReviews.length > 0) {
        setOrderId(currentProductReviews[0].order);
      } else if (data.length === 0) {
        setError('You need to purchase and receive this product before leaving a review');
      }
    } catch (err) {
      setError('Error loading your orders: ' + (err.message || 'Please try again'));
      console.error('Error fetching pending reviews:', err);
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orderId) {
      setError('Please select an order');
      return;
    }

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        productId: productId?.toString ? productId.toString() : productId,
        orderId: orderId?.toString ? orderId.toString() : orderId,
        rating,
        title: title.trim(),
        comment: comment.trim()
      };

      console.log('📝 Submitting review:', reviewData);

      if (initialReview) {
        await reviewService.updateReview(initialReview._id, reviewData, token);
        setSuccess('Review updated successfully!');
      } else {
        await reviewService.createReview(reviewData, token);
        setSuccess('Review submitted successfully!');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Error submitting review:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit review';
      setError(errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingOrders && !initialReview) {
    return (
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Write a Review</ModalTitle>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </ModalHeader>
          <InfoMessage>Loading your orders...</InfoMessage>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {initialReview ? 'Edit Review' : 'Write a Review'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          {!initialReview && !initialOrderId && pendingReviews.length > 0 && (
            <FormGroup>
              <Label htmlFor="order">Select Order *</Label>
              <Select
                id="order"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select an order --</option>
                {pendingReviews.map(review => (
                  <option key={review.order} value={review.order}>
                    Order from {new Date(review.createdAt).toLocaleDateString()} - {review.productName}
                  </option>
                ))}
              </Select>
              <InfoMessage>Select the order from which you purchased this product</InfoMessage>
            </FormGroup>
          )}

          <FormGroup>
            <Label>Rating *</Label>
            <RatingInput>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton
                  key={star}
                  active={rating >= star}
                  onClick={() => setRating(star)}
                  type="button"
                  disabled={loading}
                >
                  <FiStar fill={rating >= star ? 'currentColor' : 'none'} />
                </StarButton>
              ))}
            </RatingInput>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="title">Review Title *</Label>
            <TextInput
              id="title"
              type="text"
              placeholder="Summarize your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="100"
              disabled={loading}
            />
            <CharCount>{title.length}/100</CharCount>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="comment">Your Review *</Label>
            <TextArea
              id="comment"
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength="2000"
              disabled={loading}
            />
            <CharCount>{comment.length}/2000</CharCount>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading || !orderId}>
              {loading ? 'Submitting...' : initialReview ? 'Update Review' : 'Submit Review'}
            </SubmitButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ReviewForm;
