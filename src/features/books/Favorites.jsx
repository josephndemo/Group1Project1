import React from 'react';
import BookCard from './BookCard.jsx';

export default function Favorites({ favoriteBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, bookshelf }) {
  if (favoriteBooks.length === 0) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Favorites Identified</h2>
        <p className="text-sm text-slate-400 leading-relaxed">Click on the heart icon overlays inside catalog cards to tag custom items here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">Curated Favorites Repository</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            onRateBook={null}
          />
        ))}
      </div>
    </div>
  );
}