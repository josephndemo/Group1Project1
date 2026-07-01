import React, { useEffect, useState } from 'react';
import { BookOpen, BookMarked, MessageSquare } from 'lucide-react';
import { Star } from 'lucide-react';
import { bookClubApi } from '../../api/client.js';

const defaultCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

export default function BookClub({ onSelectBook, reviewedBooks = [], onSaveComment }) {
 const [recommendations, setRecommendations] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [commentDrafts, setCommentDrafts] = useState({});
 const booksForDiscussion = (reviewedBooks || []).map((book) => ({
  ...book,
  comments: (book.comment || '').split(/\n{2,}/).filter(Boolean),
 }));

 useEffect(() => {
  const loadRecommendations = async () => {
   try {
    setLoading(true);
    setError('');
    const data = await bookClubApi.recommendations();
    setRecommendations(data);
   } catch (err) {
    setError(err.message || 'Could not load Book Club recommendations.');
   } finally {
    setLoading(false);
   }
  };

  loadRecommendations();
 }, []);

 if (loading) {
  return <p>Loading Book Club recommendations...</p>;
 }

 if (error) {
  return <p style={{ color: 'red' }}>{error}</p>;
 }

 return (
  <section className="book-club-section">
   <h2>Discussion Forum</h2>
   <p>Pick a book, join the conversation, and add your thoughts to the thread.</p>

   <div className="book-grid" style={{ marginBottom: '2rem' }}>
    {booksForDiscussion.map((book) => (
     <article
      key={book.id}
      className="book-card"
      onClick={() => onSelectBook && onSelectBook(book)}
      style={{ cursor: onSelectBook ? 'pointer' : 'default' }}
     >
      <img
       src={book.coverUrl || book.cover_url || defaultCover}
       alt={book.title}
       style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }}
      />
      <div style={{ paddingTop: '0.75rem' }}>
       <h3>{book.title}</h3>
       <p>By {book.author}</p>
       <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: '#374151' }}>
           <BookOpen size={14} />
           {book.status === 'completed' ? 'Read' : 'In progress'}
         </span>
         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: '#374151' }}>
           <MessageSquare size={14} />
           {book.comments.length} comment{book.comments.length === 1 ? '' : 's'}
         </span>
       </div>
       <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.45rem', padding: '0.6rem', background: '#f8fafc', borderRadius: '0.7rem' }}>
        {book.comments.length === 0 ? (
         <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>No comments yet. Start the discussion.</p>
        ) : (
         book.comments.map((entry, index) => (
          <p key={`${book.id}-${index}`} style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>
           {entry}
          </p>
         ))
        )}
       </div>
       <textarea
        value={commentDrafts[book.id] ?? ''}
        onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [book.id]: event.target.value }))}
        placeholder={`Add your comment about ${book.title}`}
        style={{ width: '100%', minHeight: '80px', marginTop: '0.7rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
       />
       <button
        type="button"
        onClick={(event) => {
         event.stopPropagation();
         const draft = (commentDrafts[book.id] || '').trim();
         if (draft) {
          onSaveComment?.(book.id, draft);
          setCommentDrafts((prev) => ({ ...prev, [book.id]: '' }));
         }
        }}
        style={{ marginTop: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}
       >
        Add comment
       </button>
      </div>
     </article>
    ))}
   </div>

   <h2>Book Club Recommendations</h2>
   <p>
    These rankings are calculated from public reader reviews stored in the Flask backend.
   </p>

   {recommendations.length === 0 ? (
    <div className="empty-state">
     <h3>No recommendations yet.</h3>
     <p>Add a public review to a book to make it appear in Book Club rankings.</p>
    </div>
   ) : (
    <div className="book-grid">
     {recommendations.map((book, index) => (
      <article
       key={book.book_id || book.id}
       className="book-card"
       onClick={() => onSelectBook && onSelectBook({
        id: book.book_id || book.id,
        backendId: book.book_id || book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url || defaultCover,
        cover_url: book.cover_url || defaultCover,
        external_id: book.external_id,
        subjects: [],
       })}
       style={{ cursor: onSelectBook ? 'pointer' : 'default' }}
      >
       <img
        src={book.cover_url || defaultCover}
        alt={book.title}
        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }}
       />
       <h3>#{index + 1} {book.title}</h3>
       <p>By {book.author}</p>
       <p>
        <Star size={16} fill="currentColor" />{' '}
        {book.average_rating} average rating
       </p>
       <p>{book.review_count} public review{book.review_count === 1 ? '' : 's'}</p>
      </article>
     ))}
    </div>
   )}
  </section>
 );
}
