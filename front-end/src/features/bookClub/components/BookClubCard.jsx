import {
  Bookmark,
  Heart,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import StarRating from './StarRating.jsx';

const fallbackCover =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800';

const STATUS_LABELS = {
  want_to_read: 'Want to read',
  in_progress: 'In progress',
  completed: 'Read',
  Read: 'Read',
  'In progress': 'In progress',
};

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

function formatPrice(value) {
  if (!value) return null;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function BookClubCard({
  book,
  featured = false,
  onReadMore,
  onReview,
  onToggleFavorite,
  onToggleBookmark,
  onAddToCart,
}) {
  const isPurchasable = Boolean(book.price || book.purchaseUrl);
  const price = formatPrice(book.price);
  const usersReading = book.usersReading || [];
  const usersCompleted = book.usersCompleted || [];

  return (
    <article className={`bc-card ${featured ? 'bc-card-featured' : ''}`}>
      <div className="bc-cover-wrap">
        <img
          src={book.coverUrl || fallbackCover}
          alt={`${book.title || 'Book'} cover`}
          loading="lazy"
          className="bc-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackCover;
          }}
        />

        <div className="bc-rank-chip">#{book.rank}</div>

        <div className="bc-icon-actions">
          <button
            type="button"
            onClick={() => onToggleFavorite?.(book)}
            aria-label={`Favorite ${book.title}`}
          >
            <Heart size={18} />
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark?.(book)}
            aria-label={`Bookmark ${book.title}`}
          >
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      <div className="bc-card-body">
        <div className="bc-card-meta-row">
          <span>{book.genre || 'General Fiction'}</span>
          <span>{book.publicationYear || 'Year unknown'}</span>
          <span>{STATUS_LABELS[book.status] || 'In progress'}</span>
        </div>

        <div className="bc-title-block">
          <h3>{book.title || 'Untitled Book'}</h3>
          <p>by {book.author || 'Unknown Author'}</p>
        </div>

        <div className="bc-metrics" aria-label={`${book.title} ranking metrics`}>
          <div className="bc-metric bc-metric-rating">
            <div>
              <StarRating
                value={Math.round(Number(book.averageRating || 0))}
                readOnly
                size={16}
              />
              <strong>{formatRating(book.averageRating)}</strong>
            </div>
            <span>Average rating</span>
          </div>

          <div className="bc-metric">
            <div>
              <TrendingUp size={17} />
              <strong>{book.recommendationScore || 0}%</strong>
            </div>
            <span>Recommendation</span>
          </div>

          <div className="bc-metric">
            <div>
              <Trophy size={17} />
              <strong>#{book.rank || '—'}</strong>
            </div>
            <span>Club rank</span>
          </div>

          <div className="bc-metric">
            <div>
              <MessageCircle size={17} />
              <strong>{book.reviewCount || 0}</strong>
            </div>
            <span>Comments</span>
          </div>
        </div>

        <div className="bc-book-club-activity" style={{ display: 'grid', gap: '0.25rem', marginTop: '0.5rem' }}>
          <small>
            <strong>Reading:</strong>{' '}
            {usersReading.length > 0 ? usersReading.map((entry) => entry.username).join(', ') : 'No one yet'}
          </small>
          <small>
            <strong>Completed:</strong>{' '}
            {usersCompleted.length > 0 ? usersCompleted.map((entry) => entry.username).join(', ') : 'No one yet'}
          </small>
        </div>

        <p className="bc-description">
          {book.description || 'No description is available yet.'}
        </p>

        <div className="bc-card-footer">
          {price && <span className="bc-price">{price}</span>}

          <div className="bc-card-actions">
            <button
              type="button"
              className="bc-secondary-btn"
              onClick={() => onReadMore?.(book)}
            >
              Read More
            </button>

            <button
              type="button"
              className="bc-primary-btn"
              onClick={() => onReview?.(book)}
            >
              <Sparkles size={16} />
              Review
            </button>

            {isPurchasable && (
              <button
                type="button"
                className="bc-cart-btn"
                onClick={() => onAddToCart?.(book)}
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}