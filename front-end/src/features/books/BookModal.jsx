import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { reviewsApi } from '../../api/client.js';

export default function BookModal({ book, onClose, onEditBook, onDeleteBook }) {
 const [reviews, setReviews] = useState([]);
 const [reviewId, setReviewId] = useState(null);
 const [rating, setRating] = useState(5);
 const [reviewText, setReviewText] = useState('');
 const [isPublic, setIsPublic] = useState(true);
 const [loadingReviews, setLoadingReviews] = useState(false);
 const [reviewError, setReviewError] = useState('');
 const [reviewNotice, setReviewNotice] = useState('');

 const backendId = book?.backendId || book?.id;

 useEffect(() => {
  const loadReviews = async () => {
   if (!backendId) return;

   try {
    setLoadingReviews(true);
    setReviewError('');
    const data = await reviewsApi.listByBook(backendId);
    setReviews(data);

    const currentUserReview = data.find((item) => item.book_id === backendId && item.user_id === 1) || data[0];
    if (currentUserReview) {
     setReviewId(currentUserReview.id);
     setRating(currentUserReview.rating || 5);
     setReviewText(currentUserReview.review_text || '');
     setIsPublic(Boolean(currentUserReview.is_public));
    } else {
     setReviewId(null);
     setRating(5);
     setReviewText('');
     setIsPublic(true);
    }
   } catch (err) {
    setReviewError(err.message || 'Could not load reviews.');
   } finally {
    setLoadingReviews(false);
   }
  };

  loadReviews();
 }, [backendId]);

 if (!book) return null;

 const saveReview = async (event) => {
  event.preventDefault();
  if (!backendId) {
   setReviewError('Save the book to your library before reviewing it.');
   return;
  }

  try {
   setReviewError('');
   setReviewNotice('');
   const payload = {
    book_id: backendId,
    rating,
    review_text: reviewText.trim(),
    is_public: isPublic,
   };

   const saved = reviewId
    ? await reviewsApi.update(reviewId, payload)
    : await reviewsApi.create(payload);

   setReviewId(saved.id);
   setReviewNotice('Review saved.');
   const refreshed = await reviewsApi.listByBook(backendId);
   setReviews(refreshed);
  } catch (err) {
   setReviewError(err.message || 'Could not save review.');
  }
 };

 const deleteReview = async () => {
  if (!reviewId) return;

  try {
   await reviewsApi.remove(reviewId);
   setReviewId(null);
   setRating(5);
   setReviewText('');
   setIsPublic(true);
   setReviewNotice('Review deleted.');
   const refreshed = await reviewsApi.listByBook(backendId);
   setReviews(refreshed);
  } catch (err) {
   setReviewError(err.message || 'Could not delete review.');
  }
 };

 return (
  <div className="modal-backdrop" onClick={onClose}>
   <div className="modal-container" onClick={(e) => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose} aria-label="Close book modal">
     <X size={20} />
    </button>

    <div className="modal-body">
     <h2>{book.title}</h2>
     <p>By {book.author}</p>
     <hr />

     <h4>Book Details & Summary</h4>
     <p><strong>First Published:</strong> {book.first_published || book.year || 'N/A'}</p>
     <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
     {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
     {book.notes && <p><strong>Notes:</strong> {book.notes}</p>}

     {(onEditBook || onDeleteBook) && (
      <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0' }}>
       {onEditBook && <button onClick={() => onEditBook(book)}>Edit</button>}
       {onDeleteBook && <button onClick={() => onDeleteBook(book)}>Delete</button>}
      </div>
     )}

     <section style={{ marginTop: '1.5rem' }}>
      <h3>Your Review</h3>
      <form onSubmit={saveReview} style={{ display: 'grid', gap: '0.75rem' }}>
       <div>
        <label>Rating</label>
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.35rem' }}>
         {[1, 2, 3, 4, 5].map((star) => (
          <button
           key={star}
           type="button"
           onClick={() => setRating(star)}
           aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
           style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
          >
           <Star size={22} fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
         ))}
        </div>
       </div>

       <textarea
        value={reviewText}
        onChange={(event) => setReviewText(event.target.value)}
        placeholder="What did you think about this book?"
        style={{ padding: '0.65rem', minHeight: '90px' }}
       />

       <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
         type="checkbox"
         checked={isPublic}
         onChange={(event) => setIsPublic(event.target.checked)}
        />
        Make this review public in Book Club rankings
       </label>

       <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit">{reviewId ? 'Update Review' : 'Save Review'}</button>
        {reviewId && <button type="button" onClick={deleteReview}>Delete Review</button>}
       </div>
      </form>

      {reviewNotice && <p style={{ color: 'green' }}>{reviewNotice}</p>}
      {reviewError && <p style={{ color: 'red' }}>{reviewError}</p>}
     </section>

     <section style={{ marginTop: '1.5rem' }}>
      <h3>Reader Reviews</h3>
      {loadingReviews ? (
       <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
       <p>No reviews yet. Be the first to review this book.</p>
      ) : (
       reviews.map((item) => (
        <article key={item.id} style={{ borderTop: '1px solid #ddd', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
         <p><strong>{item.username || 'Reader'}</strong> rated this {item.rating}/5</p>
         {item.review_text && <p>{item.review_text}</p>}
         <small>{item.is_public ? 'Public review' : 'Private review'}</small>
        </article>
       ))
      )}
     </section>

     {book.subjects?.length > 0 && (
      <section style={{ marginTop: '1.5rem' }}>
       <h4>Subjects:</h4>
       <div>
        {book.subjects.map((subject, idx) => <span key={idx}> {subject} </span>)}
       </div>
      </section>
     )}
    </div>
   </div>
  </div>
 );
}
