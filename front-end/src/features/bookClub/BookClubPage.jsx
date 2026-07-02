import { useMemo, useState } from 'react';
import BookClubCard from './components/BookClubCard.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import ReviewForm from './components/ReviewForm.jsx';
import ReviewList from './components/ReviewList.jsx';
import { useBookClub } from './context/useBookClub.js';

export default function BookClubPage({
  onSaveComment,
  onToggleFavorite,
  onToggleBookmark,
  onAddToCart,
}) {
  const {
    books,
    loading,
    error,
    notice,
    submittingReview,
    submitReview,
    clearNotice,
    loadBooks,
  } = useBookClub();

  const [expandedBookId, setExpandedBookId] = useState(null);

  const topBooks = useMemo(() => books.slice(0, 3), [books]);
  const remainingBooks = useMemo(() => books.slice(3), [books]);

  const expandedBook = useMemo(
    () => books.find((book) => book.id === expandedBookId),
    [books, expandedBookId]
  );

  const expandedIsTopBook = useMemo(
    () => topBooks.some((book) => book.id === expandedBookId),
    [topBooks, expandedBookId]
  );

  const totalReviews = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.reviewCount || 0), 0),
    [books]
  );

  const topScore = books[0]?.recommendationScore || 0;

  async function handleSubmitReview(bookId, reviewInput) {
    await submitReview(bookId, reviewInput);
    onSaveComment?.(bookId, reviewInput.comment);
  }

  function toggleExpandedBook(book) {
    setExpandedBookId((currentId) => (currentId === book.id ? null : book.id));
  }

  function renderExpandedPanel(book) {
    return (
      <div className="bc-expanded-panel">
        <div className="bc-expanded-summary">
          <span>Book details</span>
          <h3>{book.title}</h3>
          <p>{book.description || 'No description is available yet.'}</p>

          <dl>
            <div>
              <dt>Author</dt>
              <dd>{book.author || 'Unknown Author'}</dd>
            </div>

            <div>
              <dt>Genre</dt>
              <dd>{book.genre || 'General Fiction'}</dd>
            </div>

            <div>
              <dt>Published</dt>
              <dd>{book.publicationYear || 'Year unknown'}</dd>
            </div>

            <div>
              <dt>Recommendation</dt>
              <dd>{book.recommendationScore || 0}%</dd>
            </div>
          </dl>
        </div>

        <ReviewForm
          bookTitle={book.title}
          submitting={submittingReview}
          onSubmit={(reviewInput) => handleSubmitReview(book.id, reviewInput)}
        />

        <ReviewList reviews={book.reviews} />
      </div>
    );
  }

  if (loading) {
    return (
      <section className="bc-page">
        <div className="bc-shell">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="bc-page">
      <div className="bc-shell">
        <header className="bc-hero">
          <div className="bc-hero-content">
            <p className="bc-kicker">Book Club Rankings</p>

            <h1>Discover the books your club cannot stop talking about.</h1>

            <p className="bc-hero-copy">
              Explore ranked picks, reader reviews, recommendation scores, and
              community discussion in one polished Book Club hub.
            </p>

            <div className="bc-hero-actions" aria-label="Book Club highlights">
              <span>Goodreads-inspired rankings</span>
              <span>Mock reviews today</span>
              <span>Flask-ready tomorrow</span>
            </div>
          </div>

          <dl className="bc-stats" aria-label="Book Club statistics">
            <div className="bc-stat-card">
              <dt>Ranked books</dt>
              <dd>{books.length}</dd>
            </div>

            <div className="bc-stat-card">
              <dt>Top score</dt>
              <dd>{topScore}%</dd>
            </div>

            <div className="bc-stat-card">
              <dt>Reader reviews</dt>
              <dd>{totalReviews}</dd>
            </div>
          </dl>
        </header>

        {notice && (
          <div role="status" aria-live="polite" className="bc-toast bc-toast-success">
            <span>{notice}</span>
            <button type="button" onClick={clearNotice}>
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="bc-error">
            <div>
              <h2>Could not load Book Club</h2>
              <p>{error}</p>
            </div>

            <button type="button" onClick={loadBooks}>
              Try again
            </button>
          </div>
        )}

        {books.length === 0 ? (
          <div className="bc-empty-state">
            <span>No picks yet</span>
            <h2>Your Book Club shelf is empty.</h2>
            <p>
              Add books and public reviews to generate rankings and discussion.
            </p>
          </div>
        ) : (
          <>
            <section className="bc-section" aria-labelledby="top-books-heading">
              <div className="bc-section-header">
                <div>
                  <p className="bc-section-eyebrow">Trending now</p>
                  <h2 id="top-books-heading">Top ranked this week</h2>
                </div>

                <p>
                  Ranked by rating, review volume, recent activity, and mock
                  popularity data.
                </p>
              </div>

              <div className="bc-featured-grid">
                {topBooks.map((book) => (
                  <BookClubCard
                    key={book.id}
                    book={book}
                    featured
                    onReadMore={toggleExpandedBook}
                    onReview={toggleExpandedBook}
                    onToggleFavorite={onToggleFavorite}
                    onToggleBookmark={onToggleBookmark}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
              {expandedIsTopBook && expandedBook && renderExpandedPanel(expandedBook)}
            </section>

            {remainingBooks.length > 0 && (
              <section className="bc-section" aria-labelledby="more-books-heading">
                <div className="bc-section-header">
                  <div>
                    <p className="bc-section-eyebrow muted">Community shelf</p>
                    <h2 id="more-books-heading">More Book Club picks</h2>
                  </div>

                  <p>
                    Continue exploring the rest of the club shelf without
                    duplicating the featured cards above.
                  </p>
                </div>

                <div className="bc-grid">
                  {remainingBooks.map((book) => {
                    const expanded = expandedBookId === book.id;

                    return (
                      <div key={book.id} className="bc-card-stack">
                        <BookClubCard
                          book={book}
                          onReadMore={toggleExpandedBook}
                          onReview={toggleExpandedBook}
                          onToggleFavorite={onToggleFavorite}
                          onToggleBookmark={onToggleBookmark}
                          onAddToCart={onAddToCart}
                        />

                        {expanded && renderExpandedPanel(book)}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
}