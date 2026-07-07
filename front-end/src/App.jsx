import { useState, useEffect } from 'react';
import { showError, showInfo, showSuccess } from './utils/swal.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import BookModal from './features/books/BookModal.jsx';
import Bookshelf from './features/books/Bookshelf.jsx';
import Favorites from './features/books/Favorites.jsx';
import { Search } from 'lucide-react';
import BookCard from './features/books/BookCard.jsx';
import BookClub from './features/bookClub/BookClub.jsx';
import { booksApi, systemApi } from './api/client.js';

const defaultCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

const normalizeBook = (book) => {
  if (!book) return null;
  return {
    id: book.external_id || book.id || String(Math.random()),
    title: book.title || 'Untitled',
    author: book.author || 'Unknown Author',
    year: book.first_published || book.year || 'N/A',
    coverUrl:
      book.cover_url && book.cover_url.startsWith('http')
        ? book.cover_url
        : book.coverUrl && book.coverUrl.startsWith('http')
          ? book.coverUrl
          : defaultCover,
    publisher: book.publisher || 'N/A',
    isbn: book.isbn || null,
    subjects: book.subjects || [],
    rating: book.rating || 0,
    backendId: book.id || null,
    external_id: book.external_id || book.id || null,
    cover_url:
      book.cover_url && book.cover_url.startsWith('http')
        ? book.cover_url
        : book.coverUrl && book.coverUrl.startsWith('http')
          ? book.coverUrl
          : defaultCover,
    notes: book.notes || '',
    comment: book.comment || '',
    status: book.status || 'want_to_read',
    first_published: book.first_published || book.year || 'N/A',
  };
};

const getBookKey = (book) => {
  const normalized = normalizeBook(book);
  return normalized?.external_id || normalized?.backendId || normalized?.id || '';
};

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
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('library_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authNotice, setAuthNotice] = useState('');
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Checking backend status...' });
  const [customBook, setCustomBook] = useState({ title: '', author: '', notes: '', first_published: '', publisher: '', cover_url: '' });
  const [customBookError, setCustomBookError] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', author: '', notes: '', first_published: '', publisher: '', cover_url: '' });

  useEffect(() => {
    localStorage.setItem('lib_bookshelf', JSON.stringify(bookshelf));
  }, [bookshelf]);

  useEffect(() => {
    localStorage.setItem('lib_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const loadUserBooks = async () => {
      if (!user) {
        setBooks([]);
        setBookshelf([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const savedBooks = await booksApi.list();
        const normalizedBooks = savedBooks.map(normalizeBook);
        setBooks(normalizedBooks);
        setBookshelf(normalizedBooks);
      } catch (err) {
        setError('Could not load your books from the backend.');
        showError('Unable to load books', err.message || 'Could not load your books from the backend.');
      } finally {
        setLoading(false);
      }
    };

    loadUserBooks();
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const checkBackendHealth = async () => {
      try {
        const result = await systemApi.health();
        if (!isMounted) return;

        if (result?.status === 'ok') {
          setBackendStatus({ state: 'online', message: 'Backend is running.' });
        } else {
          setBackendStatus({ state: 'offline', message: 'Backend status is unknown.' });
        }
      } catch {
        if (!isMounted) return;
        setBackendStatus({ state: 'offline', message: 'Backend is not reachable.' });
      }
    };

    checkBackendHealth();
    const intervalId = setInterval(checkBackendHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleViewChange = (nextView) => {
    if (nextView === 'manageBooks' && user?.role !== 'admin') {
      setView('home');
      return;
    }
    setView(nextView);
  };

  const toggleBookshelf = (clickedBook) => {
    const normalizedBook = normalizeBook(clickedBook);
    const key = getBookKey(normalizedBook);

    setBookshelf((prev) => {
      const exists = prev.some((book) => getBookKey(book) === key);
      if (exists) {
        showInfo('Removed from shelf', `${normalizedBook?.title || 'This book'} was removed from your shelf.`);
        return prev.filter((book) => getBookKey(book) !== key);
      }

      showSuccess('Added to shelf', `${normalizedBook?.title || 'This book'} is now on your shelf.`);
      return [...prev, normalizedBook];
    });
  };

  const toggleFavorite = (clickedBook) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === clickedBook.id);
      if (exists) {
        showInfo('Removed from favorites', `${clickedBook?.title || 'This book'} was removed from your favorites.`);
        return prev.filter(f => f.id !== clickedBook.id);
      }

      showSuccess('Added to favorites', `${clickedBook?.title || 'This book'} was added to your favorites.`);
      return [...prev, clickedBook];
    });
  };

  const handleRateBook = (bookId, newRating) => {
    setBookshelf(prev => prev.map(b => (getBookKey(b) === bookId || b.id === bookId ? { ...b, rating: newRating } : b)));
  };

  const handleProgressChange = async (bookId, status) => {
    const normalizedBook = bookshelf.find((entry) => getBookKey(entry) === bookId || entry.id === bookId);
    const backendId = normalizedBook?.backendId;

    if (!backendId) return;

    try {
      const updatedBook = await booksApi.update(backendId, { status });
      const normalizedUpdatedBook = normalizeBook(updatedBook);
      setBooks((prev) => prev.map((book) => (getBookKey(book) === bookId || book.backendId === backendId ? normalizedUpdatedBook : book)));
      setBookshelf((prev) => prev.map((book) => (getBookKey(book) === bookId || book.backendId === backendId ? normalizedUpdatedBook : book)));
      showSuccess('Progress updated', `Marked as ${status === 'completed' ? 'completed' : 'in progress'}.`);
    } catch (err) {
      setError(err.message || 'Could not update book progress.');
      showError('Progress update failed', err.message || 'Could not update book progress.');
    }
  };

  const handleSaveComment = async (bookId, comment) => {
    const normalizedBook = bookshelf.find((entry) => getBookKey(entry) === bookId || entry.id === bookId);
    const backendId = normalizedBook?.backendId;

    if (!backendId) return;

    const trimmedComment = comment?.trim();
    if (!trimmedComment) return;

    const existingComment = normalizedBook?.comment || '';
    const nextComment = existingComment ? `${existingComment}\n\n${trimmedComment}` : trimmedComment;

    try {
      const updatedBook = await booksApi.update(backendId, { comment: nextComment });
      const normalizedUpdatedBook = normalizeBook(updatedBook);
      setBooks((prev) => prev.map((book) => (getBookKey(book) === bookId || book.backendId === backendId ? normalizedUpdatedBook : book)));
      setBookshelf((prev) => prev.map((book) => (getBookKey(book) === bookId || book.backendId === backendId ? normalizedUpdatedBook : book)));
      showSuccess('Comment saved', 'Your comment was added to this book.');
    } catch (err) {
      setError(err.message || 'Could not save your comment.');
      showError('Comment save failed', err.message || 'Could not save your comment.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    setUser(null);
    setBooks([]);
    setBookshelf([]);
    setAuthNotice('Signed out.');
    showInfo('Signed out', 'You have been signed out of the library.');
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setAuthNotice(`Welcome back, ${authenticatedUser.username}.`);
  };

  const handleAddCustomBook = async (event) => {
    event.preventDefault();

    if (!user) {
      setAuthNotice('Please sign in to add a book.');
      return;
    }

    if (editingBook?.backendId) {
      try {
        const payload = {
          title: editDraft.title.trim(),
          author: editDraft.author.trim(),
          status: editingBook.status || 'want_to_read',
        };

        if (editDraft.notes.trim()) payload.notes = editDraft.notes.trim();
        if (editDraft.first_published.trim()) payload.first_published = editDraft.first_published.trim();
        if (editDraft.publisher.trim()) payload.publisher = editDraft.publisher.trim();
        if (editDraft.cover_url.trim()) payload.cover_url = editDraft.cover_url.trim();

        const updatedBook = await booksApi.update(editingBook.backendId, payload);
        const normalizedUpdatedBook = normalizeBook(updatedBook);
        setBooks((prev) => prev.map((book) => (getBookKey(book) === getBookKey(editingBook) || book.backendId === editingBook.backendId ? normalizedUpdatedBook : book)));
        setBookshelf((prev) => prev.map((book) => (getBookKey(book) === getBookKey(editingBook) || book.backendId === editingBook.backendId ? normalizedUpdatedBook : book)));
        setSelectedBook(normalizedUpdatedBook);
        setEditingBook(null);
        setEditDraft({ title: '', author: '', notes: '', first_published: '', publisher: '', cover_url: '' });
        setAuthNotice('Book updated.');
        showSuccess('Book updated', 'Your changes were saved.');
      } catch (err) {
        setCustomBookError(err.message || 'Could not update your book.');
        showError('Book update failed', err.message || 'Could not update your book.');
      }
      return;
    }

    const title = customBook.title.trim();
    const author = customBook.author.trim();

    if (!title || !author) {
      setCustomBookError('Please enter both a title and an author.');
      return;
    }

    try {
      setCustomBookError('');

      const payload = {
        title,
        author,
        status: 'want_to_read',
      };

      if (customBook.notes.trim()) payload.notes = customBook.notes.trim();
      if (customBook.first_published.trim()) payload.first_published = customBook.first_published.trim();
      if (customBook.publisher.trim()) payload.publisher = customBook.publisher.trim();
      if (customBook.cover_url.trim()) payload.cover_url = customBook.cover_url.trim();

      const createdBook = await booksApi.create(payload);

      const normalizedCreatedBook = normalizeBook(createdBook);
      setBooks((prev) => [normalizedCreatedBook, ...prev]);
      setCustomBook({ title: '', author: '', notes: '', first_published: '', publisher: '', cover_url: '' });
      setAuthNotice('Your book was added to your library.');
      showSuccess('Book added', 'Your book was added to your library.');
    } catch (err) {
      setCustomBookError(err.message || 'Could not add your book.');
      showError('Book not added', err.message || 'Could not add your book.');
    }
  };

  const handleOpenEditBook = (book) => {
    const normalizedBook = normalizeBook(book);
    setEditingBook(normalizedBook);
    setEditDraft({
      title: normalizedBook?.title || '',
      author: normalizedBook?.author || '',
      notes: normalizedBook?.notes || '',
      first_published: normalizedBook?.first_published || '',
      publisher: normalizedBook?.publisher || '',
      cover_url: normalizedBook?.coverUrl || normalizedBook?.cover_url || '',
    });
  };

  const handleSaveEditedBook = async (event) => {
    event.preventDefault();
    if (!editingBook?.backendId) return;

    try {
      const payload = {
        title: editDraft.title.trim(),
        author: editDraft.author.trim(),
        status: editingBook.status || 'want_to_read',
      };

      if (editDraft.notes.trim()) payload.notes = editDraft.notes.trim();
      if (editDraft.first_published.trim()) payload.first_published = editDraft.first_published.trim();
      if (editDraft.publisher.trim()) payload.publisher = editDraft.publisher.trim();
      if (editDraft.cover_url.trim()) payload.cover_url = editDraft.cover_url.trim();

      const updatedBook = await booksApi.update(editingBook.backendId, payload);

      const normalizedUpdatedBook = normalizeBook(updatedBook);
      setBooks((prev) => prev.map((book) => (getBookKey(book) === getBookKey(editingBook) || book.backendId === editingBook.backendId ? normalizedUpdatedBook : book)));
      setBookshelf((prev) => prev.map((book) => (getBookKey(book) === getBookKey(editingBook) || book.backendId === editingBook.backendId ? normalizedUpdatedBook : book)));
      setSelectedBook(normalizedUpdatedBook);
      setEditingBook(null);
      setAuthNotice('Book updated.');
      showSuccess('Book updated', 'Your changes were saved.');
    } catch (err) {
      setError(err.message || 'Could not update your book.');
      showError('Book update failed', err.message || 'Could not update your book.');
    }
  };

  const handleDeleteBook = async (book) => {
    const normalizedBook = normalizeBook(book);
    const backendId = normalizedBook?.backendId;
    if (!backendId) return;

    try {
      await booksApi.remove(backendId);
      setBooks((prev) => prev.filter((item) => getBookKey(item) !== getBookKey(normalizedBook)));
      setBookshelf((prev) => prev.filter((item) => getBookKey(item) !== getBookKey(normalizedBook)));
      setFavorites((prev) => prev.filter((item) => getBookKey(item) !== getBookKey(normalizedBook)));
      setSelectedBook(null);
      setEditingBook(null);
      setAuthNotice('Book deleted.');
      showSuccess('Book deleted', 'The book was removed from your library.');
    } catch (err) {
      setError(err.message || 'Could not delete your book.');
      showError('Delete failed', err.message || 'Could not delete your book.');
    }
  };

  const visibleBooks = books.filter((book) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [book.title, book.author, book.notes].some((value) => (value || '').toLowerCase().includes(query));
  });

  if (!user) {
    return (
      <div className="app-container">
        <main className="auth-main">
          <div className={`status-message backend-status ${backendStatus.state}`}>{backendStatus.message}</div>
          <AuthPanel onAuthSuccess={handleAuthSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        currentView={view}
        onViewChange={handleViewChange}
        user={user}
        onLogout={handleLogout}
      />

      <main>
        {authNotice && <div className="status-message">{authNotice}</div>}
        <div className={`status-message backend-status ${backendStatus.state}`}>{backendStatus.message}</div>

        {view === 'home' && (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search your books by title, author, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading && (
              <div className="loading-box">
                <span className="loading-text">Loading your library...</span>
                <div className="progress-track"><div className="progress-bar-fill"></div></div>
              </div>
            )}

            {error && <div className="status-message error-message">{error}</div>}

            {!loading && !error && (
              visibleBooks.length > 0 ? (
                <div className="book-grid">
                  {visibleBooks.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={setSelectedBook}
                      onToggleBookshelf={toggleBookshelf}
                      onToggleFavorite={toggleFavorite}
                      isBookshelf={bookshelf.some(saved => getBookKey(saved) === getBookKey(book))}
                      isFavorite={favorites.some(favorite => getBookKey(favorite) === getBookKey(book))}
                      showRating={false}
                      showActions={true}
                      onRateBook={handleRateBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results"><h3>No books yet. Add one above to start your library.</h3></div>
              )
            )}
          </>
        )}

        {view === 'manageBooks' && (
          <div className="manage-books-layout">
            <div className="manage-books-library-column">
              <div className="manage-books-section-header">
                <div>
                  <p className="manage-books-kicker">Library inventory</p>
                  <h3>Available books</h3>
                </div>
                <span className="manage-books-pill">{visibleBooks.length} titles</span>
              </div>

              {visibleBooks.length > 0 ? (
                <div className="book-grid">
                  {visibleBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={setSelectedBook}
                      onToggleBookshelf={toggleBookshelf}
                      onToggleFavorite={toggleFavorite}
                      isBookshelf={bookshelf.some((saved) => getBookKey(saved) === getBookKey(book))}
                      isFavorite={favorites.some((favorite) => getBookKey(favorite) === getBookKey(book))}
                      showRating={false}
                      showActions={false}
                      onEditBook={handleOpenEditBook}
                      onDeleteBook={handleDeleteBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results"><h3>No books available yet.</h3></div>
              )}
            </div>

            <aside className="manage-books-panel">
              <div className="manage-books-panel-header">
                <div>
                  <p className="manage-books-kicker">Quick add</p>
                  <h3>{editingBook ? 'Edit book' : 'Add a book'}</h3>
                </div>
                <span className="manage-books-badge">{editingBook ? 'Update' : 'New'}</span>
              </div>

              <form className="manage-book-form" onSubmit={handleAddCustomBook}>
                <div className="manage-book-field-grid">
                  <label className="manage-book-field">
                    <span>Title</span>
                    <input
                      className="manage-book-input"
                      type="text"
                      placeholder="Enter the title"
                      value={editingBook ? editDraft.title : customBook.title}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, title: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, title: event.target.value }));
                        }
                      }}
                    />
                  </label>

                  <label className="manage-book-field">
                    <span>Author</span>
                    <input
                      className="manage-book-input"
                      type="text"
                      placeholder="Who wrote it?"
                      value={editingBook ? editDraft.author : customBook.author}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, author: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, author: event.target.value }));
                        }
                      }}
                    />
                  </label>

                  <label className="manage-book-field">
                    <span>First published</span>
                    <input
                      className="manage-book-input"
                      type="text"
                      placeholder="Year or edition"
                      value={editingBook ? editDraft.first_published : customBook.first_published}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, first_published: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, first_published: event.target.value }));
                        }
                      }}
                    />
                  </label>

                  <label className="manage-book-field">
                    <span>Publisher</span>
                    <input
                      className="manage-book-input"
                      type="text"
                      placeholder="Publisher name"
                      value={editingBook ? editDraft.publisher : customBook.publisher}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, publisher: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, publisher: event.target.value }));
                        }
                      }}
                    />
                  </label>

                  <label className="manage-book-field">
                    <span>Cover image URL</span>
                    <input
                      className="manage-book-input"
                      type="text"
                      placeholder="https://example.com/cover.jpg"
                      value={editingBook ? editDraft.cover_url : customBook.cover_url}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, cover_url: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, cover_url: event.target.value }));
                        }
                      }}
                    />
                  </label>

                  <label className="manage-book-field">
                    <span>Notes</span>
                    <textarea
                      className="manage-book-textarea"
                      placeholder="Add a quick note or reading reminder"
                      value={editingBook ? editDraft.notes : customBook.notes}
                      onChange={(event) => {
                        if (editingBook) {
                          setEditDraft((prev) => ({ ...prev, notes: event.target.value }));
                        } else {
                          setCustomBook((prev) => ({ ...prev, notes: event.target.value }));
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="manage-book-actions">
                  <button className="manage-book-submit-btn" type="submit">
                    {editingBook ? 'Update book' : 'Save book'}
                  </button>
                  {editingBook && (
                    <button
                      className="manage-book-cancel-btn"
                      type="button"
                      onClick={() => {
                        setEditingBook(null);
                        setEditDraft({ title: '', author: '', notes: '', first_published: '', publisher: '', cover_url: '' });
                        setCustomBookError('');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {customBookError && <p className="manage-book-error">{customBookError}</p>}
            </aside>
          </div>
        )}

        {view === 'bookshelf' && (
          <Bookshelf
            shelfBooks={bookshelf}
            onSelectBook={setSelectedBook}
            onToggleBookshelf={toggleBookshelf}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onRateBook={handleRateBook}
            onProgressChange={handleProgressChange}
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

        {view === 'bookClub' && (
          <BookClub
            reviewedBooks={bookshelf}
            onSelectBook={setSelectedBook}
            onToggleBookshelf={toggleBookshelf}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onRateBook={handleRateBook}
            onSaveComment={handleSaveComment}
          />
        )}
      </main>

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onEditBook={handleOpenEditBook}
        onDeleteBook={handleDeleteBook}
      />

      {editingBook && (
        <div className="modal-backdrop" onClick={() => setEditingBook(null)}>
          <div className="modal-container" onClick={(event) => event.stopPropagation()}>
            <div className="modal-body">
              <h3>Edit book</h3>
              <form onSubmit={handleSaveEditedBook} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Title"
                  value={editDraft.title}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))}
                  style={{ padding: '0.65rem' }}
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={editDraft.author}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, author: event.target.value }))}
                  style={{ padding: '0.65rem' }}
                />
                <input
                  type="text"
                  placeholder="First Published"
                  value={editDraft.first_published}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, first_published: event.target.value }))}
                  style={{ padding: '0.65rem' }}
                />
                <input
                  type="text"
                  placeholder="Publisher"
                  value={editDraft.publisher}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, publisher: event.target.value }))}
                  style={{ padding: '0.65rem' }}
                />
                <input
                  type="text"
                  placeholder="Cover Image URL"
                  value={editDraft.cover_url}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, cover_url: event.target.value }))}
                  style={{ padding: '0.65rem' }}
                />
                <textarea
                  placeholder="Notes"
                  value={editDraft.notes}
                  onChange={(event) => setEditDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  style={{ padding: '0.65rem', minHeight: '90px' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit">Save changes</button>
                  <button type="button" onClick={() => setEditingBook(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}