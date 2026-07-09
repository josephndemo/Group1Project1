import StarRating from './StarRating.jsx';

function formatDate(value) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="bc-review-empty">
        <span>No comments yet</span>
        <p>Be the first reader to start the conversation.</p>
      </div>
    );
  }

  return (
    <div className="bc-review-list">
      {reviews.map((review) => (
        <article key={review.id} className="bc-review-card">
          {review.rating ? <StarRating value={review.rating} readOnly size={16} /> : null}

          <p>{review.comment}</p>

          <footer>
            — {review.reviewerName || 'Anonymous Reader'}
            <span>·</span>
            {formatDate(review.createdAt)}
          </footer>
        </article>
      ))}
    </div>
  );
}