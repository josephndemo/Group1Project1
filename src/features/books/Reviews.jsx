import React from 'react';
import BookCard from './BookCard.jsx';

export default function Reviews({ shelfBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, favorites, onRateBook, onAddComment }) {
  const ratedBooks = shelfBooks.filter(book => (book.rating || 0) > 0);
  const sortedRatedBooks = [...ratedBooks].sort((a, b) => b.rating - a.rating);

  if (sortedRatedBooks.length === 0) {
    return (
      <div className="empty-view-state">
        <h2>No Rated Books Found</h2>
        <p>Assign a star rating to books inside your Bookshelf tab to unlock this analytics board.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Critiques & Ratings Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Your rated items are ranked automatically from highest score down to lowest.</p>
      
      <div className="book-grid">
        {sortedRatedBooks.map((book) => (
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
            showComment={true}
            onAddComment={onAddComment} // Connect explicitly named handler
          />
        ))}
      </div>
    </div>
  );
}