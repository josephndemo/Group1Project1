import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import BookModal from "./features/books/BookModal.jsx";
import Bookshelf from "./features/books/Bookshelf.jsx";
import Favorites from "./features/books/Favorites.jsx";
import Reviews from "./features/books/Reviews.jsx";
import BookCard from "./features/books/BookCard.jsx"; 
import { fetchBooks } from "./features/books/bookService.js";
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home'); 

  const [bookshelf, setBookshelf] = useState(() => {
    const saved = localStorage.getItem('lib_bookshelf');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('lib_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { localStorage.setItem('lib_bookshelf', JSON.stringify(bookshelf)); }, [bookshelf]);
  useEffect(() => { localStorage.setItem('lib_favorites', JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedTerm(searchTerm); setPage(1); }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // SweetAlert2 Enhanced Mutators
  const toggleBookshelf = (clickedBook) => {
    setBookshelf(prev => {
      const exists = prev.some(b => b.id === clickedBook.id);
      if (exists) {
        Swal.fire({
          title: 'Removed from Bookshelf',
          text: `"${clickedBook.title}" has been taken off your tracking shelf.`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
        return prev.filter(b => b.id !== clickedBook.id);
      }
      
      Swal.fire({
        title: 'Added to Bookshelf!',
        text: `"${clickedBook.title}" is now added to your tracker.`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
      return [...prev, { ...clickedBook, rating: 0, status: 'in progress', comments: [] }];
    });
  };

  const toggleFavorite = (clickedBook) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === clickedBook.id);
      if (exists) {
        Swal.fire({
          title: 'Removed from Favorites',
          text: `"${clickedBook.title}" removed from your curated likes.`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
        return prev.filter(f => f.id !== clickedBook.id);
      }
      
      Swal.fire({
        title: 'Saved to Favorites!',
        text: `Liked "${clickedBook.title}"`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
      return [...prev, clickedBook];
    });
  };

  const handleRateBook = (bookId, newRating) => {
    setBookshelf(prev => prev.map(b => b.id === bookId ? { ...b, rating: newRating } : b));
    Swal.fire({
      title: 'Rating Updated!',
      text: `You gave this book a ${newRating}-star rating.`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handleStatusChange = (bookId, newStatus) => {
    setBookshelf(prev => prev.map(b => b.id === bookId ? { ...b, status: newStatus } : b));
    Swal.fire({
      title: 'Status Updated',
      text: `Reading status set to "${newStatus.toUpperCase()}"`,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  };

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
        return { ...b, comments: [newCommentObj, ...(b.comments || [])] };
      }
      return b;
    }));

    Swal.fire({
      title: 'Note Saved!',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const totalPages = Math.min(Math.ceil(totalResults / 30), 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar currentView={view} onViewChange={setView} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {view === 'home' && (
          <>
            <div className="mb-8 max-w-xl mx-auto">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Search thousands of books across global archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <span className="text-slate-500 font-medium">Querying open library records...</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 text-center max-w-md mx-auto">
                {error}
              </div>
            )}
            
            {!loading && !error && (
              books.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button 
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm disabled:opacity-40 disabled:hover:bg-white transition-all"
                      onClick={() => setPage(p => Math.max(p - 1, 1))} 
                      disabled={page === 1}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-slate-500">Page <strong className="text-slate-800">{page}</strong> of {totalPages || 1}</span>
                    <button 
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm disabled:opacity-40 disabled:hover:bg-white transition-all"
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                      disabled={page >= totalPages}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-400 font-medium">No match records uncovered</div>
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