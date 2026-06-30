import React from 'react';
import { Bookmark, Heart, Star, Edit3, Trash2 } from 'lucide-react';

const fallbackCover =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600';

export default function BookCard({
  book,
  onSelect,
  onToggleBookshelf,
  onToggleFavorite,
  isBookshelf,
  isFavorite,
  showRating,
  onRateBook,
  onEditBook,
  onDeleteBook
}) {
  const coverImage = book.coverUrl || book.cover_url || fallbackCover;

  const handleRating = (event, ratingValue) => {
    event.stopPropagation();
    if (onRateBook) onRateBook(book.id, ratingValue);
  };

  const handleAction = (event, callback) => {
    event.stopPropagation();
    if (callback) callback(book);
  };

  return (
    <article className="book-card" onClick={() => onSelect(book)}>
      <div className="card-image-wrapper">
        <img
          src={coverImage}
          alt={`${book.title || 'Book'} cover`}
          className="book-cover-image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackCover;
          }}
        />
      </div>

      <div className="card-content">
        <div className="book-meta">
          <h3 className="book-title">{book.title || 'Untitled Book'}</h3>
          <p className="book-author">By {book.author || 'Unknown Author'}</p>
        </div>

        {showRating && (
          <div className="rating-system" aria-label="Book rating">
            <span className="rating-label">Rating</span>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${book.rating >= star ? 'filled' : ''}`}
                  onClick={(event) => handleRating(event, star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={16}
                    fill={book.rating >= star ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="book-details">
          <p>
            <span>First Published</span>
            {book.first_published || book.year || 'N/A'}
          </p>

          <p>
            <span>Publisher</span>
            {book.publisher || 'N/A'}
          </p>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className={`action-btn ${isBookshelf ? 'active-bookshelf' : ''}`}
            onClick={(event) => handleAction(event, onToggleBookshelf)}
          >
            <Bookmark size={15} />
            {isBookshelf ? 'Saved' : 'Save'}
          </button>

          <button
            type="button"
            className={`action-btn ${isFavorite ? 'active-favorite' : ''}`}
            onClick={(event) => handleAction(event, onToggleFavorite)}
          >
            <Heart size={15} />
            {isFavorite ? 'Liked' : 'Favorite'}
          </button>
        </div>

        {(onEditBook || onDeleteBook) && (
          <div className="card-actions secondary-actions">
            {onEditBook && (
              <button
                type="button"
                className="action-btn muted-action"
                onClick={(event) => handleAction(event, onEditBook)}
              >
                <Edit3 size={14} />
                Edit
              </button>
            )}

            {onDeleteBook && (
              <button
                type="button"
                className="action-btn danger-action"
                onClick={(event) => handleAction(event, onDeleteBook)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}