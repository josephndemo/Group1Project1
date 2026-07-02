import { useEffect, useReducer } from 'react';
import { bookClubService } from '../services/bookClubService.js';
import { rankBooks } from '../utils/ranking.js';
import { BookClubContext } from './bookClubContext.js';
import { showError, showSuccess } from '../../../utils/swal.js';

const initialState = {
  books: [],
  loading: true,
  error: '',
  submittingReview: false,
  notice: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: '' };

    case 'LOAD_SUCCESS':
      return { ...state, loading: false, books: action.payload };

    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'SUBMIT_REVIEW_START':
      return { ...state, submittingReview: true, notice: '' };

    case 'SUBMIT_REVIEW_OPTIMISTIC': {
      const { bookId, review } = action.payload;

      const books = state.books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              reviews: [review, ...(book.reviews || [])],
            }
          : book
      );

      return {
        ...state,
        books: rankBooks(books),
      };
    }

    case 'SUBMIT_REVIEW_SUCCESS':
      return {
        ...state,
        submittingReview: false,
        notice: 'Review posted successfully.',
      };

    case 'SUBMIT_REVIEW_ERROR':
      return {
        ...state,
        submittingReview: false,
        error: action.payload,
      };

    case 'CLEAR_NOTICE':
      return { ...state, notice: '' };

    default:
      return state;
  }
}

export function BookClubProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function loadBooks() {
    try {
      dispatch({ type: 'LOAD_START' });
      const books = await bookClubService.getBooks();
      dispatch({ type: 'LOAD_SUCCESS', payload: books });
    } catch (error) {
      const message = error.message || 'Could not load Book Club books.';
      dispatch({
        type: 'LOAD_ERROR',
        payload: message,
      });
      showError('Book Club unavailable', message);
    }
  }

  async function submitReview(bookId, reviewInput) {
    const optimisticReview = {
      id: `optimistic-${Date.now()}`,
      bookId,
      rating: Number(reviewInput.rating),
      comment: reviewInput.comment,
      reviewerName: reviewInput.reviewerName || 'Anonymous Reader',
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    try {
      dispatch({ type: 'SUBMIT_REVIEW_START' });
      dispatch({
        type: 'SUBMIT_REVIEW_OPTIMISTIC',
        payload: { bookId, review: optimisticReview },
      });

      await bookClubService.createReview(bookId, reviewInput);

      const refreshedBooks = await bookClubService.getBooks();
      dispatch({ type: 'LOAD_SUCCESS', payload: refreshedBooks });
      dispatch({ type: 'SUBMIT_REVIEW_SUCCESS' });
      showSuccess('Review posted', 'Your review was shared with the club.');
    } catch (error) {
      await loadBooks();

      const message = error.message || 'Could not submit review.';
      dispatch({
        type: 'SUBMIT_REVIEW_ERROR',
        payload: message,
      });
      showError('Review failed', message);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <BookClubContext.Provider
      value={{
        ...state,
        loadBooks,
        submitReview,
        clearNotice: () => dispatch({ type: 'CLEAR_NOTICE' }),
      }}
    >
      {children}
    </BookClubContext.Provider>
  );
}