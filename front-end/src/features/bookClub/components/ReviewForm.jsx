import { useState } from 'react';

export default function ReviewForm({ bookTitle, submitting, onSubmit }) {
  const [reviewerName] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'Anonymous Reader';
    }

    try {
      const savedUser = JSON.parse(window.localStorage.getItem('library_user') || 'null');
      return savedUser?.username || savedUser?.email || 'Anonymous Reader';
    } catch {
      return 'Anonymous Reader';
    }
  });
  const [comment, setComment] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    onSubmit({
      reviewerName,
      comment: trimmedComment,
    });

    setComment('');
  }

  return (
    <form onSubmit={handleSubmit} className="bc-review-form">
      <div className="bc-review-form-header">
        <span>Your Review</span>
        <h4>{bookTitle}</h4>
        <p className="bc-review-form-meta">Posting as {reviewerName}</p>
      </div>

      <div className="bc-form-field">
        <label htmlFor="reviewComment">Comment</label>
        <textarea
          id="reviewComment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write a comment like Facebook..."
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !comment.trim()}
        className="bc-submit-btn"
      >
        {submitting ? 'Posting comment...' : 'Post comment'}
      </button>
    </form>
  );
}