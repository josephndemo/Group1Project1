import { useEffect, useId, useRef, useState } from 'react';

export default function ReviewForm({
  bookTitle,
  submitting,
  autoFocusRequest,
  onSubmit,
}) {
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
  const commentInputId = useId();
  const formRef = useRef(null);
  const commentRef = useRef(null);

  useEffect(() => {
    if (!autoFocusRequest || !commentRef.current || !formRef.current) {
      return;
    }

    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentRef.current.focus({ preventScroll: true });
    const textLength = commentRef.current.value.length;
    commentRef.current.setSelectionRange(textLength, textLength);
  }, [autoFocusRequest]);

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
    <form ref={formRef} onSubmit={handleSubmit} className="bc-review-form">
      <div className="bc-review-form-header">
        <span>Your Review</span>
        <h4>{bookTitle}</h4>
        <p className="bc-review-form-meta">Posting as {reviewerName}</p>
      </div>

      <div className="bc-form-field">
        <label htmlFor={commentInputId}>Comment</label>
        <textarea
          id={commentInputId}
          ref={commentRef}
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