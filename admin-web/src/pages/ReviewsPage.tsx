import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Review } from '../types';
import { getApiError } from '../utils/apiError';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        // Fetch all stadiums and their reviews
        const stadiumsRes = await api.get('/admin/stadiums');
        const stadiums = stadiumsRes.data;
        
        const allReviews: Review[] = [];
        for (const stadium of stadiums) {
          try {
            const reviewsRes = await api.get(`/reviews/stadium/${stadium.id}`);
            const stadiumReviews = reviewsRes.data.reviews.map((r: Review) => ({
              ...r,
              stadium: { id: stadium.id, name: stadium.name, location: stadium.location },
            }));
            allReviews.push(...stadiumReviews);
          } catch (err) {
            console.error(`Failed to fetch reviews for stadium ${stadium.id}`, err);
          }
        }
        
        // Sort by most recent
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(allReviews);
      } catch (err) {
        setError(getApiError(err, 'Failed to load reviews.'));
      } finally {
        setLoading(false);
      }
    };
    fetchAllReviews();
  }, []);

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-base ${
              star <= rating ? 'text-[#F59E0B]' : 'text-[var(--color-border-strong)]'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
          All Reviews
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm">
          Monitor and manage player reviews and turf owner replies across all stadiums.
        </p>
      </div>

      {/* Stats */}
      {!loading && reviews.length > 0 && (
        <div className="flex flex-nowrap items-center gap-2 mb-6 overflow-x-auto pb-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 rounded-xl border transition-all flex-shrink-0 min-w-[90px] text-center ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm font-extrabold'
                : 'bg-[var(--color-surface-card)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] font-semibold hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <div className="text-2xl font-black mb-1">{reviews.length}</div>
            <div className="text-[10px] uppercase tracking-wider">All Reviews</div>
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter(rating.toString() as any)}
              className={`px-4 py-3 rounded-xl border transition-all flex-shrink-0 min-w-[90px] text-center ${
                filter === rating.toString()
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm font-extrabold'
                  : 'bg-[var(--color-surface-card)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] font-semibold hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <div className="text-2xl font-black mb-1">{ratingCounts[rating as keyof typeof ratingCounts]}</div>
              <div className="text-[10px] uppercase tracking-wider flex items-center justify-center gap-1">
                {rating} <span className={filter === rating.toString() ? 'text-white' : 'text-[#F59E0B]'}>★</span>
              </div>
            </button>
          ))}
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
        <div className="flex items-center justify-center gap-3.5 py-16">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading reviews…</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && reviews.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">💬</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No reviews yet</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            Reviews will appear here once players start reviewing stadiums.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && filteredReviews.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
          
          {/* Mobile Reviews List */}
          <div className="block sm:hidden divide-y divide-[var(--color-border)]">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 flex flex-col gap-3 hover:bg-[var(--color-surface-muted)] transition-colors">
                {/* Header: Player Avatar + Name + Date */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1e40af] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {review.player?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-base)]">{review.player?.name}</p>
                      <p className="text-[0.6875rem] text-[var(--color-text-muted)]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Stadium details */}
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-base)]">{review.stadium?.name}</p>
                  <p className="text-[0.6875rem] text-[var(--color-text-muted)]">📍 {review.stadium?.location}</p>
                </div>

                {/* Comment & Reply */}
                {review.comment ? (
                  <div className="bg-[var(--color-surface-muted)] rounded-lg p-2.5 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{review.comment}</p>
                    {review.ownerReply && (
                      <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                        <p className="text-[0.625rem] font-extrabold text-[#16a34a] uppercase tracking-wide mb-0.5">Owner Response</p>
                        <p className="text-xs text-[#166534] leading-relaxed">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[0.6875rem] text-[var(--color-text-muted)] italic">No comment</span>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table List */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Player</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Stadium</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Comment</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1e40af] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {review.player?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-base)]">{review.player?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-base)]">{review.stadium?.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">📍 {review.stadium?.location}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      {review.comment ? (
                        <div>
                          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-2">{review.comment}</p>
                          {review.ownerReply && (
                            <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                              <p className="text-xs font-bold text-[#16a34a] uppercase tracking-wide mb-1">Owner Response</p>
                              <p className="text-sm text-[#166534] leading-relaxed">{review.ownerReply}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] italic">No comment</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-[var(--color-text-muted)] font-semibold whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredReviews.length === 0 && reviews.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">🔍</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No {filter}-star reviews</p>
          <p className="text-sm text-[var(--color-text-muted)]">Try selecting a different rating filter</p>
        </div>
      )}
    </div>
  );
}
