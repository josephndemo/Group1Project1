import React from 'react';
import BookCard from './BookCard.jsx';

export default function Bookshelf({ shelfBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, favorites, onRateBook }) {
  if (shelfBooks.length === 0) {
    return (
      <div className="empty-view-state">
        <h2>Your Bookshelf is Empty</h2>
        <p>Return to the main library catalog page to track books you want to read.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', letterSpacing: '-0.02em' }}>My Personal Tracker Bookshelf</h2>
      <div className="book-grid">
        {shelfBooks.map((book) => (
          <BookCard 
            key={book.id}
            book={book}
            onSelect={onSelectBook}
            onToggleBookshelf={onToggleBookshelf}
            onToggleFavorite={onToggleFavorite}
            isBookshelf={true}
            isFavorite={favorites.some(f => f.id === book.id)}
            showRating={true}
            onRateBook={onRateBook}
          />
        ))}
      </div>
    </div>
  );
}