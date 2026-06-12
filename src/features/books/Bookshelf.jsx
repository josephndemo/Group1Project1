import React from 'react';
import BookCard from './BookCard.jsx';

export default function Bookshelf({ shelfBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, favorites, onRateBook, onStatusChange }) {
  if (shelfBooks.length === 0) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-2">Your Bookshelf is Empty</h2>
        <p className="text-sm text-slate-400 leading-relaxed">Return to the main library catalog page to track books you want to read.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">My Personal Tracker Bookshelf</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            showStatus={true}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}