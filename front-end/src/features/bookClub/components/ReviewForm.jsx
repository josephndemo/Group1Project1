import { useState } from 'react';
import StarRating from './StarRating.jsx';

export default function ReviewForm({ bookTitle, submitting, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    onSubmit({
      rating,
      reviewerName,
      comment: trimmedComment,
    });

    setRating(5);
    setReviewerName('');
    setComment('');
  }

  return (
    <form onSubmit={handleSubmit} className="bc-review-form">
      <div className="bc-review-form-header">
        <span>Your review</span>
        <h4>{bookTitle}</h4>
      </div>

      <div className="bc-form-field">
        <label>Your rating</label>
        <StarRating value={rating} onChange={setRating} label={`Rate ${bookTitle}`} />
      </div>

      <div className="bc-form-field">
        <label htmlFor="reviewerName">Name optional</label>
        <input
          id="reviewerName"
          value={reviewerName}
          onChange={(event) => setReviewerName(event.target.value)}
          placeholder="Anonymous Reader"
        />
      </div>

      <div className="bc-form-field">
        <label htmlFor="reviewComment">Comment</label>
        <textarea
          id="reviewComment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you think about this book?"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !comment.trim()}
        className="bc-submit-btn"
      >
        {submitting ? 'Posting review...' : 'Post review'}
      </button>
    </form>
  );
}