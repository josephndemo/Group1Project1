import { useEffect, useState } from 'react';
import { BookOpen, MessageSquare, Star } from 'lucide-react';
import { bookClubApi } from '../../api/client.js';

const defaultCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

export default function BookClub({ onSelectBook, reviewedBooks = [], onSaveComment }) {
 const [recommendations, setRecommendations] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [commentDrafts, setCommentDrafts] = useState({});
 const [openConversationId, setOpenConversationId] = useState(null);
 const booksForDiscussion = (reviewedBooks || [])
  .map((book) => ({
   ...book,
   comments: (book.comment || '').split(/\n{2,}/).filter(Boolean),
  }))
  .filter((book) => book.status === 'completed' || book.comments.length > 0);

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

   <div className="book-grid book-club-feed" style={{ marginBottom: '2rem' }}>
    {booksForDiscussion.length === 0 ? (
     <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
      <h3>No discussions yet.</h3>
      <p>Books with comments will appear here once readers start a conversation.</p>
     </div>
    ) : (
     booksForDiscussion.map((book) => {
      const isOpen = openConversationId === book.id;
      return (
       <article
        key={book.id}
        className="book-card book-club-post"
        onClick={() => onSelectBook && onSelectBook(book)}
        style={{ cursor: onSelectBook ? 'pointer' : 'default' }}
       >
        <div className="book-club-post-header">
         <div className="book-club-avatar">{(book.author || 'U').charAt(0).toUpperCase()}</div>
         <div>
          <h3>{book.title}</h3>
          <p>by {book.author} • {book.status === 'completed' ? 'Finished reading' : 'Currently reading'}</p>
         </div>
        </div>

        <div className="book-club-post-body">
         <img
          src={book.coverUrl || book.cover_url || defaultCover}
          alt={book.title}
         />
         <div className="book-club-post-copy">
          <p className="book-club-post-text">
            {book.comments[0] || 'A lively discussion is underway for this book.'}
          </p>
         </div>
        </div>

        <div className="book-club-post-actions">
         <button
          type="button"
          className="book-club-action-btn"
          onClick={(event) => {
           event.stopPropagation();
           setOpenConversationId((current) => (current === book.id ? null : book.id));
          }}
         >
          <MessageSquare size={15} />
          {book.comments.length} comment{book.comments.length === 1 ? '' : 's'}
         </button>
        </div>

         {isOpen && (
          <div
           onClick={(event) => event.stopPropagation()}
           className="book-club-conversation"
          >
           <div className="book-club-thread">
            {book.comments.map((entry, index) => (
             <div key={`${book.id}-${index}`} className="book-club-thread-item">
              <strong>{book.author}</strong>
              <p>{entry}</p>
             </div>
            ))}
           </div>
           <div className="book-club-comment-box">
            <label>Join conversation</label>
            <textarea
             value={commentDrafts[book.id] ?? ''}
             onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [book.id]: event.target.value }))}
             placeholder={`Write something about ${book.title}`}
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
            >
             Add comment
            </button>
           </div>
          </div>
         )}
       </article>
      );
     })
    )}
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
