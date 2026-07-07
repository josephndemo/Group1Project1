import { mockBookClubBooks } from '../data/mockBookClubData.js';
import { rankBooks } from '../utils/ranking.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://group1project3-2.onrender.com';
const USE_MOCKS = import.meta.env.VITE_USE_MOCK_BOOK_CLUB !== 'false';
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

function getMockBooksWithLocalReviews() {
  const localReviews = readStoredReviews();

  return mockBookClubBooks.map((book) => ({
    ...book,
    reviews: [...(book.reviews || []), ...(localReviews[book.id] || [])],
  }));
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export const bookClubService = {
  async getBooks() {
    if (USE_MOCKS) {
      await delay();
      return rankBooks(getMockBooksWithLocalReviews());
    }

    return request('/books');
  },

  async getRankings() {
    if (USE_MOCKS) {
      await delay();
      return rankBooks(getMockBooksWithLocalReviews());
    }

    return request('/books/rankings');
  },

  async getBookReviews(bookId) {
    if (USE_MOCKS) {
      await delay();
      const book = getMockBooksWithLocalReviews().find((item) => item.id === bookId);
      return book?.reviews || [];
    }

    return request(`/books/${bookId}/reviews`);
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

    return request(`/books/${bookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewInput),
    });
  },
};