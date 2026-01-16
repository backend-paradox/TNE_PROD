import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cineTripPackagesAPI, CreateReviewData } from '@/services/packageService';
import './ReviewForm.css';

interface ReviewFormProps {
  packageSlug: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ packageSlug, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-populate name and email when user logs in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!isAuthenticated || !user) {
      setError('Please login first to submit a review');
      return;
    }

    // Validate rating
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    // Validate comment
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const reviewData: CreateReviewData = {
        userId: user.id,
        userName: name || user.name || user.email,
        userEmail: email || user.email,
        rating,
        comment: comment.trim(),
      };

      await cineTripPackagesAPI.createReview(packageSlug, reviewData);

      // Success
      setSuccessMessage('Review submitted successfully! Thank you for your feedback.');
      setRating(0);
      setComment('');
      // Keep name and email for logged-in users

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="review-form-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`review-form-star ${
              (hoveredRating || rating) >= star ? 'active' : ''
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={isSubmitting}
          >
            <Star
              className={`star-icon ${
                (hoveredRating || rating) >= star ? 'filled' : ''
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="review-form-rating-text">
            {rating} {rating === 1 ? 'star' : 'stars'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Write a Review</h3>

      {!isAuthenticated && (
        <div className="review-form-auth-notice">
          Please login to submit a review
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="review-form-group">
          <label className="review-form-label">Your Rating</label>
          {renderStars()}
        </div>

        <div className="review-form-row">
          <div className="review-form-group">
            <label htmlFor="name" className="review-form-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="review-form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting || !isAuthenticated}
              readOnly={isAuthenticated}
            />
          </div>

          <div className="review-form-group">
            <label htmlFor="email" className="review-form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="review-form-input"
              placeholder="john.doe@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || !isAuthenticated}
              readOnly={isAuthenticated}
            />
          </div>
        </div>

        <div className="review-form-group">
          <label htmlFor="comment" className="review-form-label">
            Your Review
          </label>
          <textarea
            id="comment"
            className="review-form-textarea"
            rows={5}
            placeholder="Share your experience with this CineTrip package..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting || !isAuthenticated}
          />
        </div>

        {error && (
          <div className="review-form-error">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="review-form-success">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="review-form-submit"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
