import React from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { CineTripReview, ReviewStats } from '@/services/packageService';
import './ReviewList.css';

interface ReviewListProps {
  reviews: CineTripReview[];
  stats: ReviewStats;
  onMarkHelpful?: (reviewId: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, stats, onMarkHelpful }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`review-star ${star <= rating ? 'filled' : ''}`}
          />
        ))}
      </div>
    );
  };

  const renderStarDistribution = () => {
    const maxCount = Math.max(...Object.values(stats.starDistribution));

    return (
      <div className="star-distribution">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats.starDistribution[stars as keyof typeof stats.starDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={stars} className="star-distribution-row">
              <span className="star-distribution-label">{stars} stars</span>
              <div className="star-distribution-bar-container">
                <div
                  className="star-distribution-bar"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="star-distribution-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="review-list-container">
      {/* Review Summary */}
      <div className="review-summary">
        <div className="review-summary-score">
          <div className="review-average-rating">{stats.averageRating.toFixed(1)}</div>
          <div className="review-average-stars">
            {renderStars(Math.round(stats.averageRating))}
          </div>
          <div className="review-total-count">
            Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="review-summary-distribution">
          {renderStarDistribution()}
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        <h3 className="reviews-list-title">Customer Reviews</h3>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this package!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-user-info">
                  <div className="review-user-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="review-user-name">
                      {review.userName}
                      {review.verified && (
                        <CheckCircle className="verified-badge" title="Verified Purchase" />
                      )}
                    </div>
                    <div className="review-date">{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <p className="review-comment">{review.comment}</p>

              <div className="review-footer">
                <button
                  className="review-helpful-btn"
                  onClick={() => onMarkHelpful && onMarkHelpful(review.id)}
                  disabled={!onMarkHelpful}
                >
                  <ThumbsUp className="helpful-icon" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
