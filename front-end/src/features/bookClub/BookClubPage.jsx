// Book Club presentation page: renders ranked books and threaded discussion
// panels powered by the Book Club context service.
import { useEffect, useMemo, useState } from 'react';
import BookClubCard from './components/BookClubCard.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import ReviewForm from './components/ReviewForm.jsx';
import ReviewList from './components/ReviewList.jsx';
import { useBookClub } from './context/useBookClub.js';

const fallbackCover =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800';

export default function BookClubPage({
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
  const [reviewModalBookId, setReviewModalBookId] = useState(null);
  const [reviewFocusRequest, setReviewFocusRequest] = useState({ bookId: null, nonce: 0 });

  const topBooks = useMemo(() => books, [books]);

  const expandedBook = useMemo(
    () => books.find((book) => book.id === expandedBookId),
    [books, expandedBookId]
  );

  const expandedIsTopBook = useMemo(
    () => topBooks.some((book) => book.id === expandedBookId),
    [topBooks, expandedBookId]
  );

  const reviewModalBook = useMemo(
    () => books.find((book) => book.id === reviewModalBookId) || null,
    [books, reviewModalBookId]
  );

  useEffect(() => {
    if (!reviewModalBookId) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setReviewModalBookId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reviewModalBookId]);

  async function handleSubmitReview(bookId, reviewInput) {
    await submitReview(bookId, reviewInput);
  }

  function toggleExpandedBook(book) {
    setReviewFocusRequest({ bookId: null, nonce: 0 });
    setExpandedBookId((currentId) => (currentId === book.id ? null : book.id));
  }

  function handleReviewClick(book) {
    setReviewModalBookId(book.id);
    setReviewFocusRequest({ bookId: book.id, nonce: Date.now() });
  }

  function closeReviewModal() {
    setReviewModalBookId(null);
    setReviewFocusRequest({ bookId: null, nonce: 0 });
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
          autoFocusRequest={
            reviewFocusRequest.bookId === book.id ? reviewFocusRequest.nonce : null
          }
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
                    onReview={handleReviewClick}
                    onToggleFavorite={onToggleFavorite}
                    onToggleBookmark={onToggleBookmark}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
              {expandedIsTopBook && expandedBook && renderExpandedPanel(expandedBook)}
            </section>

          </>
        )}
      </div>

      {reviewModalBook && (
        <div
          className="bc-review-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Comment on ${reviewModalBook.title}`}
          onClick={closeReviewModal}
        >
          <div className="bc-review-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="bc-review-modal-close"
              aria-label="Close comment dialog"
              onClick={closeReviewModal}
            >
              ×
            </button>

            <div className="bc-expanded-panel bc-review-modal-panel">
              <div className="bc-expanded-summary">
                <div className="bc-review-modal-cover-wrap">
                  <img
                    src={reviewModalBook.coverUrl || fallbackCover}
                    alt={`${reviewModalBook.title || 'Book'} cover`}
                    loading="lazy"
                    className="bc-review-modal-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackCover;
                    }}
                  />
                </div>

                <span>Book details</span>
                <h3>{reviewModalBook.title}</h3>
                <p>{reviewModalBook.description || 'No description is available yet.'}</p>

                <dl>
                  <div>
                    <dt>Author</dt>
                    <dd>{reviewModalBook.author || 'Unknown Author'}</dd>
                  </div>

                  <div>
                    <dt>Genre</dt>
                    <dd>{reviewModalBook.genre || 'General Fiction'}</dd>
                  </div>

                  <div>
                    <dt>Published</dt>
                    <dd>{reviewModalBook.publicationYear || 'Year unknown'}</dd>
                  </div>

                  <div>
                    <dt>Recommendation</dt>
                    <dd>{reviewModalBook.recommendationScore || 0}%</dd>
                  </div>
                </dl>
              </div>

              <ReviewForm
                bookTitle={reviewModalBook.title}
                submitting={submittingReview}
                autoFocusRequest={
                  reviewFocusRequest.bookId === reviewModalBook.id
                    ? reviewFocusRequest.nonce
                    : null
                }
                onSubmit={(reviewInput) => handleSubmitReview(reviewModalBook.id, reviewInput)}
              />

              <ReviewList reviews={reviewModalBook.reviews} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}