import { mockBookClubBooks } from '../data/mockBookClubData.js';
import { rankBooks } from '../utils/ranking.js';
import { bookClubApi, reviewsApi } from '../../../api/client.js';

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_BOOK_CLUB === 'true';
const LOCAL_REVIEW_KEY = 'bookClub.mockReviews';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStoredReviews() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_REVIEW_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStoredReviews(reviewsByBookId) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(LOCAL_REVIEW_KEY, JSON.stringify(reviewsByBookId));
}

function normalizeApiReview(review = {}) {
  return {
    id: review.id,
    bookId: review.book_id || review.bookId,
    rating: Number(review.rating || 0),
    comment: review.review_text || review.comment || '',
    reviewerName: review.user?.username || review.reviewerName || 'Reader',
    createdAt: review.created_at || review.createdAt,
  };
}

function normalizeApiBook(book = {}) {
  const reviews = (book.reviews || []).map(normalizeApiReview);
  const averageRating = Number(book.average_rating ?? book.averageRating ?? 0);
  const reviewCount = Number(book.review_count ?? book.reviewCount ?? reviews.length);

  return {
    ...book,
    id: book.id || book.book_id,
    bookId: book.book_id || book.id,
    coverUrl: book.cover_url || book.coverUrl,
    externalId: book.external_id || book.externalId,
    averageRating,
    reviewCount,
    reviews,
  };
}

function getMockBooksWithLocalReviews() {
  const localReviews = readStoredReviews();

  return mockBookClubBooks.map((book) => ({
    ...book,
    reviews: [...(book.reviews || []), ...(localReviews[book.id] || [])],
  }));
}

export const bookClubService = {
  async getBooks() {
    if (USE_MOCKS) {
      await delay();
      return rankBooks(getMockBooksWithLocalReviews());
    }

    const books = await bookClubApi.recommendations();
    return rankBooks((books || []).map(normalizeApiBook));
  },

  async getRankings() {
    return this.getBooks();
  },

  async getBookReviews(bookId) {
    if (USE_MOCKS) {
      await delay();
      const book = getMockBooksWithLocalReviews().find((item) => item.id === bookId);
      return book?.reviews || [];
    }

    const reviews = await reviewsApi.listByBook(bookId);
    return (reviews || []).map(normalizeApiReview);
  },

  async createReview(bookId, reviewInput) {
    if (USE_MOCKS) {
      await delay();

      const reviewsByBookId = readStoredReviews();

      const newReview = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `review-${Date.now()}`,
        bookId,
        rating: Number(reviewInput.rating),
        comment: reviewInput.comment.trim(),
        reviewerName: reviewInput.reviewerName?.trim() || 'Anonymous Reader',
        createdAt: new Date().toISOString(),
      };

      reviewsByBookId[bookId] = [newReview, ...(reviewsByBookId[bookId] || [])];
      writeStoredReviews(reviewsByBookId);

      return newReview;
    }

    const createdReview = await reviewsApi.create({
      book_id: bookId,
      rating: Number(reviewInput.rating),
      review_text: reviewInput.comment?.trim() || '',
      is_public: true,
    });

    return normalizeApiReview(createdReview);
  },
};
