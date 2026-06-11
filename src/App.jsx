import React, { useState, useEffect } from 'react';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import BookGrid from "./features/books/BookGrid.jsx";
import BookModal from "./features/books/BookModal.jsx";
import Bookshelf from "./features/books/Bookshelf.jsx";
import Favorites from "./features/books/Favorites.jsx";
import Reviews from "./features/books/Reviews.jsx";
import BookCard from "./features/books/BookCard.jsx"; 
import { fetchBooks } from "./features/books/bookService.js";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home'); 

  // Initialize and Sync State via LocalStorage with fallback arrays
  const [bookshelf, setBookshelf] = useState(() => {
    const saved = localStorage.getItem('lib_bookshelf');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('lib_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Main Live Book Search Feed states
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Write changes automatically to disk on update loops
  useEffect(() => { localStorage.setItem('lib_bookshelf', JSON.stringify(bookshelf)); }, [bookshelf]);
  useEffect(() => { localStorage.setItem('lib_favorites', JSON.stringify(favorites)); }, [favorites]);

  // Debounce rapid user keystroke search configurations safely (600ms boundary)
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedTerm(searchTerm); setPage(1); }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle live network bindings to fetch catalog cards
  useEffect(() => {
    let isMounted = true;
    if (view !== 'home') return;

    async function loadLibraryData() {
      const cleanQuery = debouncedTerm.trim().toLowerCase();
      if (cleanQuery.length > 0 && cleanQuery.length < 3) return;

      try {
        setLoading(true);
        setError(null);
        const query = cleanQuery || 'classic literature';
        const data = await fetchBooks(query, page);
        if (isMounted) {
          setBooks(data.books);
          setTotalResults(data.totalResults);
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch book indices from the Open Library network API.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLibraryData();
    return () => { isMounted = false; };
  }, [debouncedTerm, page, view]);

  // Action Mutator Pipelines
  const toggleBookshelf = (clickedBook) => {
    setBookshelf(prev => {
      const exists = prev.some(b => b.id === clickedBook.id);
      if (exists) return prev.filter(b => b.id !== clickedBook.id);
      // Hard constraint initialization with baseline default structures
      return [...prev, { ...clickedBook, rating: 0, status: 'in progress', comments: [] }];
    });
  };

  const toggleFavorite = (clickedBook) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === clickedBook.id);
      if (exists) return prev.filter(f => f.id !== clickedBook.id);
      return [...prev, clickedBook];
    });
  };

  const handleRateBook = (bookId, newRating) => {
    setBookshelf(prev => prev.map(b => b.id === bookId ? { ...b, rating: newRating } : b));
  };

  const handleStatusChange = (bookId, newStatus) => {
    setBookshelf(prev => prev.map(b => b.id === bookId ? { ...b, status: newStatus } : b));
  };

  // Structured Multi-Comment Thread Handler
  const handleAddComment = (bookId, commentText) => {
    const timestampStr = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const newCommentObj = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
      text: commentText,
      timestamp: timestampStr
    };

    setBookshelf(prev => prev.map(b => {
      if (b.id === bookId) {
        const existingComments = b.comments || [];
        return {
          ...b,
          // Unshift newest entries directly to the top edge of the stack listing
          comments: [newCommentObj, ...existingComments]
        };
      }
      return b;
    }));
  };

  const totalPages = Math.min(Math.ceil(totalResults / 30), 100);

  return (
    <div className="app-container">
      <Navbar currentView={view} onViewChange={setView} />
      
      <main>
        {view === 'home' && (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search thousands of books across global archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading && (
              <div className="loading-box">
                <span className="loading-text">Querying open library records...</span>
                <div className="progress-track"><div className="progress-bar-fill"></div></div>
              </div>
            )}
            
            {error && <div className="status-message error-message">{error}</div>}
            
            {!loading && !error && (
              books.length > 0 ? (
                <>
                  <div className="book-grid">
                    {books.map(book => {
                      const shelfMatch = bookshelf.find(b => b.id === book.id);
                      return (
                        <BookCard 
                          key={book.id}
                          book={shelfMatch || book}
                          onSelect={setSelectedBook}
                          onToggleBookshelf={toggleBookshelf}
                          onToggleFavorite={toggleFavorite}
                          isBookshelf={!!shelfMatch}
                          isFavorite={favorites.some(f => f.id === book.id)}
                          showRating={!!shelfMatch}
                          onRateBook={handleRateBook}
                          showStatus={!!shelfMatch}
                          onStatusChange={handleStatusChange}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="pagination-container">
                    <button className="pagination-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                      <ChevronLeft size={18} /> Previous
                    </button>
                    <span className="pagination-info">Page <strong>{page}</strong> of {totalPages || 1}</span>
                    <button className="pagination-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages}>
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-results"><h3>No match records uncovered</h3></div>
              )
            )}
          </>
        )}

        {view === 'bookshelf' && (
          <Bookshelf 
            shelfBooks={bookshelf}
            onSelectBook={setSelectedBook}
            onToggleBookshelf={toggleBookshelf}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onRateBook={handleRateBook}
            onStatusChange={handleStatusChange}
          />
        )}

        {view === 'favorites' && (
          <Favorites 
            favoriteBooks={favorites}
            onSelectBook={setSelectedBook}
            onToggleBookshelf={toggleBookshelf}
            onToggleFavorite={toggleFavorite}
            bookshelf={bookshelf}
          />
        )}

        {view === 'reviews' && (
          <Reviews 
            shelfBooks={bookshelf}
            onSelectBook={setSelectedBook}
            onToggleBookshelf={toggleBookshelf}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onRateBook={handleRateBook}
            onAddComment={handleAddComment}
          />
        )}
      </main>

      <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      <Footer />
    </div>
  );
}