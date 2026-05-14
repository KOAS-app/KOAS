import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Review } from '../types';
import { getApiError } from '../utils/apiError';

export default function ReviewsPage() {
  const navigate = useNavigate();

  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      // First get the stadium
      const stadiumRes = await api.get('/stadiums/my');
      const stadium = stadiumRes.data[0];
      
      if (!stadium) {
        setError('No stadium found. Please create a stadium first.');
        setLoading(false);
        return;
      }

      setStadiumId(stadium.id);

      // Then fetch reviews
      const res = await api.get(`/reviews/stadium/${stadium.id}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      setError(getApiError(err, 'Failed to load reviews.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = (reviewId: string, existingReply?: string) => {
    setReplyingTo(reviewId);
    setReplyText(existingReply || '');
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply: replyText.trim() });
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      alert(getApiError(err, 'Failed to submit reply'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Delete your reply?')) return;
    
    try {
      await api.delete(`/reviews/${reviewId}/reply`);
      fetchReviews();
    } catch (err) {
      alert(getApiError(err, 'Failed to delete reply'));
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-base ${
              star <= rating ? 'text-[#F59E0B]' : 'text-[var(--color-border)]'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Reviews
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            See what players are saying about your stadium
          </p>
        </div>
      </div>

      {/* Summary Card */}
      {!loading && totalReviews > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-6 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-[var(--color-primary)] mb-2">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="flex-1 border-l border-[var(--color-border)] pl-6">
              <p className="text-[var(--color-text-base)] font-bold text-lg mb-1">
                {totalReviews} Review{totalReviews !== 1 ? 's' : ''}
              </p>
              <p className="text-[var(--color-text-muted)] text-sm">
                Average rating from all players who have reviewed your stadium
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm">Loading reviews…</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && reviews.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">💬</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No reviews yet</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            When players book and review your stadium, their feedback will appear here.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-5 shadow-sm transition-all hover:bg-[var(--color-surface-hover)]"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#15803d] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">
                      {review.player?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Name & Rating */}
                  <div>
                    <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight">
                      {review.player?.name}
                    </p>
                    {renderStars(review.rating)}
                  </div>
                </div>
                {/* Date */}
                <span className="text-xs text-[var(--color-text-muted)] font-semibold whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pl-[52px] mb-3">
                  {review.comment}
                </p>
              )}

              {/* Owner Reply Section */}
              {review.ownerReply && !replyingTo && (
                <div className="pl-[52px] mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary-bg)] border border-[#bbf7d0] rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wide">
                        Owner Response
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(review.id, review.ownerReply)}
                          className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReply(review.id)}
                          className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#166534] leading-relaxed">{review.ownerReply}</p>
                    {review.repliedAt && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        Replied {new Date(review.repliedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="pl-[52px] mt-4 pt-4 border-t border-[var(--color-border)]">
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">
                    Your Response
                  </label>
                  <textarea
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white resize-y min-h-[80px]"
                    placeholder="Write your response to this review..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {replyText.length}/500
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelReply}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting || !replyText.trim()}
                      >
                        {submitting ? 'Submitting...' : review.ownerReply ? 'Update Reply' : 'Submit Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {!review.ownerReply && replyingTo !== review.id && (
                <div className="pl-[52px] mt-3">
                  <button
                    onClick={() => handleReply(review.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-bg)] border border-[#bbf7d0] transition-all hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 10 4 15 9 20"></polyline>
                      <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                    </svg>
                    Reply to Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
