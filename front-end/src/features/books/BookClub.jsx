import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import BookCard from './BookCard.jsx';

export default function BookClub({
  reviewedBooks = [],
  onSelectBook,
  onToggleBookshelf,
  onToggleFavorite,
  favorites = [],
  onRateBook,
}) {
  const rankedBooks = useMemo(() => {
    return [...reviewedBooks]
      .filter((book) => Number(book.rating) > 0)
      .sort((a, b) => {
        const ratingDifference = Number(b.rating) - Number(a.rating);

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return String(a.title).localeCompare(String(b.title));
      });
  }, [reviewedBooks]);

  const averageRating =
    rankedBooks.length > 0
      ? (
          rankedBooks.reduce((total, book) => total + Number(book.rating), 0) /
          rankedBooks.length
        ).toFixed(1)
      : '0.0';

  if (rankedBooks.length === 0) {
    return (
      <div className="empty-view-state">
        <h2>No Reviewed Books Yet</h2>
        <p>
          Add books to your bookshelf and rate them from 1 to 5 stars. Rated
          books will appear here as Book Club recommendations.
        </p>
      </div>
    );
  }

  return (
    <section className="book-club-page">
      <div className="book-club-hero">
        <div>
          <p className="book-club-kicker">Reader Recommendations</p>
          <h1>Book Club Rankings</h1>
          <p className="book-club-intro">
            Discover the most liked books based on reader star reviews. Books
            are ranked from highest rated to lowest rated.
          </p>
        </div>

        <div className="book-club-stats">
          <div className="book-club-stat-card">
            <span>{rankedBooks.length}</span>
            <small>Reviewed Books</small>
          </div>

          <div className="book-club-stat-card">
            <span>{averageRating}</span>
            <small>Average Rating</small>
          </div>

          <div className="book-club-stat-card">
            <span>{rankedBooks[0].rating}/5</span>
            <small>Top Rating</small>
          </div>
        </div>
      </div>

      <div className="book-club-section-heading">
        <h2>Most Recommended Books</h2>
        <p>Ranked by reader rating on a scale of 1 to 5 stars.</p>
      </div>

      <div className="book-grid">
        {rankedBooks.map((book, index) => (
          <div className="book-club-ranked-card" key={book.id}>
            <div className="rank-badge">#{index + 1}</div>

            <div className="review-summary">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  className={Number(book.rating) >= star ? 'filled-star' : ''}
                  fill={Number(book.rating) >= star ? 'currentColor' : 'none'}
                />
              ))}
              <span>{book.rating}/5 reader rating</span>
            </div>

            <BookCard
              book={book}
              onSelect={onSelectBook}
              onToggleBookshelf={onToggleBookshelf}
              onToggleFavorite={onToggleFavorite}
              isBookshelf={true}
              isFavorite={favorites.some((favorite) => favorite.id === book.id)}
              showRating={true}
              onRateBook={onRateBook}
            />
          </div>
        ))}
      </div>
    </section>
  );
}