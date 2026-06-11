import React, { useState } from 'react';
import { Bookmark, Heart, Star } from 'lucide-react';

export default function BookCard({ 
  book, onSelect, onToggleBookshelf, onToggleFavorite, isBookshelf, isFavorite, 
  showRating, onRateBook, showStatus, onStatusChange, showComment, onAddComment 
}) {
  
  // Local state container to isolate active typing buffer changes
  const [localText, setLocalText] = useState('');

  const handleRating = (e, ratingValue) => {
    e.stopPropagation();
    if (onRateBook) onRateBook(book.id, ratingValue);
  };

  const handleSaveComment = (e) => {
    e.stopPropagation();
    if (!localText.trim()) return;
    
    if (onAddComment) {
      onAddComment(book.id, localText.trim());
    }
    setLocalText(''); // Clear typing area buffer on successful dispatch
  };

  return (
    <div className="book-card" onClick={() => onSelect(book)}>
      <div className="card-image-wrapper">
        <img src={book.coverUrl} alt={book.title} loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">By {book.author}</p>
        
        {/* Interactive Reading Status Element */}
        {showStatus && (
          <div className="status-badge-container" onClick={(e) => e.stopPropagation()}>
            <span className="status-label">Status:</span>
            <select 
              className="status-select"
              value={book.status || 'in progress'}
              onChange={(e) => onStatusChange(book.id, e.target.value)}
            >
              <option value="in progress">In Progress</option>
              <option value="read">Read</option>
            </select>
          </div>
        )}

        {/* Dynamic Star Interactive Layer */}
        {showRating && (
          <div className="rating-system">
            <span className="rating-label">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${(book.rating || 0) >= star ? 'filled' : ''}`}
                onClick={(e) => handleRating(e, star)}
              >
                <Star size={16} fill={(book.rating || 0) >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Live Threading Comments Area */}
        {showComment && (
          <div className="review-card-addon" onClick={(e) => e.stopPropagation()}>
            <div className="review-input-group">
              <span className="status-label">Add a New Comment/Note:</span>
              <textarea
                className="review-textarea"
                placeholder="Type details, quotes, or key takeaways..."
                value={localText}
                onChange={(e) => setLocalText(e.target.value)}
              />
              <button 
                className="save-comment-btn"
                onClick={handleSaveComment}
                disabled={!localText.trim()}
              >
                Save Note
              </button>
            </div>

            {/* Historical Chronological Note Iteration Block */}
            {book.comments && book.comments.length > 0 && (
              <div className="comments-timeline-thread">
                {book.comments.map((item, idx) => (
                  <div key={item.id || idx} className="single-comment-bubble">
                    <p className="comment-bubble-text">{item.text}</p>
                    <small className="comment-bubble-meta">{item.timestamp}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card-footer">
          <span>Published: {book.year}</span>
        </div>

        <div className="card-actions">
          <button className={`action-btn ${isBookshelf ? 'active-bookshelf' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleBookshelf(book); }}>
            <Bookmark size={14} fill={isBookshelf ? "currentColor" : "none"} /> {isBookshelf ? 'Saved' : 'Bookshelf'}
          </button>
          <button className={`action-btn ${isFavorite ? 'active-favorite' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(book); }}>
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? 'Liked' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
}