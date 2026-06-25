import React from 'react';
import { Bookmark, Heart, Star } from 'lucide-react';

export default function BookCard({ book, onSelect, onToggleBookshelf, onToggleFavorite, isBookshelf, isFavorite, showRating, onRateBook, onEditBook, onDeleteBook }) {

  const handleRating = (e, ratingValue) => {
    e.stopPropagation();
    if (onRateBook) onRateBook(book.id, ratingValue);
  };

  return (
    <div className="book-card" onClick={() => onSelect(book)}>
      <div className="card-image-wrapper">
        <img src={book.coverUrl} alt={book.title} loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">By {book.author}</p>

        {/* Dynamic Star Interactive Subsystem for My Bookshelf Dashboard */}
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

        <div className="card-footer">
          <span>First Published: {book.first_published || book.year || 'N/A'}</span>
          <span style={{ display: 'block', marginTop: '0.25rem' }}>Publisher: {book.publisher || 'N/A'}</span>
        </div>

        {/* Global Control Buttons */}
        <div className="card-actions">
          <button
            className={`action-btn ${isBookshelf ? 'active-bookshelf' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleBookshelf(book); }}
          >
            <Bookmark size={14} fill={isBookshelf ? "currentColor" : "none"} />
            {isBookshelf ? 'Saved' : 'Bookshelf'}
          </button>

          <button
            className={`action-btn ${isFavorite ? 'active-favorite' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book); }}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? 'Liked' : 'Favorite'}
          </button>
        </div>

        {(onEditBook || onDeleteBook) && (
          <div className="card-actions" style={{ marginTop: '0.5rem' }}>
            {onEditBook && (
              <button
                className="action-btn"
                onClick={(e) => { e.stopPropagation(); onEditBook(book); }}
              >
                Edit
              </button>
            )}
            {onDeleteBook && (
              <button
                className="action-btn"
                onClick={(e) => { e.stopPropagation(); onDeleteBook(book); }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}