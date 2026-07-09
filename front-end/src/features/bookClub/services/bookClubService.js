import { mockBookClubBooks } from '../data/mockBookClubData.js';
import { rankBooks } from '../utils/ranking.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://group1project1-1.onrender.com';
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

function getMockBooksWithLocalReviews() {
  const localReviews = readStoredReviews();

  return mockBookClubBooks.map((book) => ({
    ...book,
    reviews: [...(book.reviews || []), ...(localReviews[book.id] || [])],
  }));
}

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage?.getItem('library_token') : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function normalizeBookClubBook(book, index = 0) {
  return {
    id: String(book.id || book.book_key || index + 1),
    title: book.title || 'Untitled',
    author: book.author || 'Unknown Author',
    coverUrl: book.cover_url || book.coverUrl,
    publicationYear: book.first_published || 'N/A',
    status: (book.users_completed || []).length > 0 ? 'Read' : 'In progress',
    averageRating: Number(book.averageRating || 0),
    reviewCount: Number(book.review_count || book.reviewCount || 0),
    recommendationScore: Number(book.recommendationScore || 0),
    usersReading: book.users_reading || book.usersReading || [],
    usersCompleted: book.users_completed || book.usersCompleted || [],
    reviews: book.reviews || [],
  };
}

export const bookClubService = {
  async getBooks() {
    if (USE_MOCKS) {
      await delay();
      return rankBooks(getMockBooksWithLocalReviews());
    }

    const books = await request('/book-club/books');
    return rankBooks((books || []).map((book, index) => normalizeBookClubBook(book, index)));
  },

  async getRankings() {
    if (USE_MOCKS) {
      await delay();
      return rankBooks(getMockBooksWithLocalReviews());
    }

    const books = await request('/book-club/books');
    return rankBooks((books || []).map((book, index) => normalizeBookClubBook(book, index)));
  },

  async getBookReviews(bookId) {
    if (USE_MOCKS) {
      await delay();
      const book = getMockBooksWithLocalReviews().find((item) => item.id === bookId);
      return book?.reviews || [];
    }

    return request(`/book-club/books/${encodeURIComponent(bookId)}/comments`);
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

    return request(`/book-club/books/${encodeURIComponent(bookId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: reviewInput.comment }),
    });
  },
};