import React, { useEffect, useState } from 'react';
import { reviewsApi } from '../../api/client.js';

export default function MyReviews() {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [editingId, setEditingId] = useState(null);
 const [draft, setDraft] = useState({ rating: 5, review_text: '', is_public: true });

 const loadReviews = async () => {
  try {
   setLoading(true);
   setError('');
   const data = await reviewsApi.list();
   setReviews(data);
  } catch (err) {
   setError(err.message || 'Could not load your reviews.');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  loadReviews();
 }, []);

 const startEdit = (review) => {
  setEditingId(review.id);
  setDraft({
   rating: review.rating || 5,
   review_text: review.review_text || '',
   is_public: Boolean(review.is_public),
  });
 };

 const saveEdit = async (reviewId) => {
  await reviewsApi.update(reviewId, draft);
  setEditingId(null);
  await loadReviews();
 };

 const deleteReview = async (reviewId) => {
  await reviewsApi.remove(reviewId);
  await loadReviews();
 };

 if (loading) return <p>Loading your reviews...</p>;
 if (error) return <p style={{ color: 'red' }}>{error}</p>;

 return (
  <section>
   <h2>My Reviews</h2>
   <p>Manage the ratings and written reviews you have submitted.</p>

   {reviews.length === 0 ? (
    <div className="empty-state">
     <h3>No reviews yet.</h3>
     <p>Open a saved book and add a rating to create your first review.</p>
    </div>
   ) : (
    <div style={{ display: 'grid', gap: '1rem' }}>
     {reviews.map((review) => (
      <article key={review.id} className="book-card">
       <h3>{review.book_title || 'Untitled book'}</h3>
       <p>By {review.book_author || 'Unknown Author'}</p>

       {editingId === review.id ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
         <label>
          Rating
          <select
           value={draft.rating}
           onChange={(event) => setDraft((prev) => ({ ...prev, rating: Number(event.target.value) }))}
          >
           {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
          </select>
         </label>

         <textarea
          value={draft.review_text}
          onChange={(event) => setDraft((prev) => ({ ...prev, review_text: event.target.value }))}
          style={{ padding: '0.65rem', minHeight: '90px' }}
         />

         <label>
          <input
           type="checkbox"
           checked={draft.is_public}
           onChange={(event) => setDraft((prev) => ({ ...prev, is_public: event.target.checked }))}
          />{' '}
          Public
         </label>

         <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => saveEdit(review.id)}>Save</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
         </div>
        </div>
       ) : (
        <>
         <p><strong>Rating:</strong> {review.rating}/5</p>
         {review.review_text && <p>{review.review_text}</p>}
         <p><strong>Visibility:</strong> {review.is_public ? 'Public' : 'Private'}</p>
         <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => startEdit(review)}>Edit</button>
          <button onClick={() => deleteReview(review.id)}>Delete</button>
         </div>
        </>
       )}
      </article>
     ))}
    </div>
   )}
  </section>
 );
}
