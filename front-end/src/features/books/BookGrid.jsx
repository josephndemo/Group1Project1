import React from 'react';
import BookCard from './BookCard.jsx';

export default function BookGrid({ books, onSelectBook }) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onSelectBook} />
      ))}
    </div>
  );
}