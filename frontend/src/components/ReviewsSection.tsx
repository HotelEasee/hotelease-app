import React, { useState, useEffect } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { userAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import toast from 'react-hot-toast';
import './ReviewsSection.css';

interface Review {
  review_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsSectionProps {
  hotelId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ hotelId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadReviews();
  }, [hotelId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getHotelReviews(hotelId);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      await userAPI.createReview(hotelId, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      loadReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star empty'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <div className="reviews-summary">
          <div className="rating-display">
            <span className="average-rating">{averageRating.toFixed(1)}</span>
            <div className="stars-container">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="total-reviews">({totalReviews} reviews)</span>
          </div>
        </div>
        {isAuthenticated && (
          <button
            className="write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && isAuthenticated && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="form-group">
            <label>Your Rating</label>
            <div className="star-rating-input">
              {Array.from({ length: 5 }).map((_, index) => (
                <FaStar
                  key={index}
                  className={`star-input ${index < reviewRating ? 'filled' : 'empty'}`}
                  onClick={() => setReviewRating(index + 1)}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="review-comment">Your Review</label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={5}
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowReviewForm(false);
                setReviewComment('');
                setReviewRating(5);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">No reviews yet. Be the first to review!</div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <FaUserCircle className="reviewer-avatar" />
                  <div>
                    <div className="reviewer-name">{review.user_name || 'Anonymous'}</div>
                    <div className="review-date">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              {review.comment && (
                <div className="review-comment">{review.comment}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;

