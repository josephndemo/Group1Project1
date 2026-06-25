import React from 'react';
import BookCard from './BookCard.jsx';

export default function Favorites({ favoriteBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, bookshelf }) {
  if (favoriteBooks.length === 0) {
    return (
      <div className="empty-view-state">
        <h2>No Favorites Identified</h2>
        <p>Click on the heart icon overlays inside catalog cards to tag custom items here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', letterSpacing: '-0.02em' }}>Curated Favorites Repository</h2>
      <div className="book-grid">
        {favoriteBooks.map((book) => (
          <BookCard 
            key={book.id}
            book={book}
            onSelect={onSelectBook}
            onToggleBookshelf={onToggleBookshelf}
            onToggleFavorite={onToggleFavorite}
            isBookshelf={bookshelf.some(b => b.id === book.id)}
            isFavorite={true}
            showRating={bookshelf.some(b => b.id === book.id)}
            onRateBook={null} // Rates directly inside Bookshelf View contexts
          />
        ))}
      </div>
    </div>
  );
}