import BookCard from './BookCard.jsx';

const getBookKey = (book) => book?.external_id || book?.backendId || book?.id || '';

export default function Favorites({ favoriteBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, bookshelf }) {
  if (favoriteBooks.length === 0) {
    return (
      <div className="empty-view-state">
        <h2>No Favorites Identified</h2>
        <p>Click on the heart icon overlays inside catalog cards to tag custom items here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', letterSpacing: '-0.02em' }}>Curated Favorites Repository</h2>
      <div className="book-grid">
        {favoriteBooks.map((book) => (
          <BookCard 
            key={getBookKey(book)}
            book={book}
            onSelect={onSelectBook}
            onToggleBookshelf={onToggleBookshelf}
            onToggleFavorite={onToggleFavorite}
            isBookshelf={bookshelf.some((shelfBook) => getBookKey(shelfBook) === getBookKey(book))}
            isFavorite={true}
            showRating={bookshelf.some((shelfBook) => getBookKey(shelfBook) === getBookKey(book))}
            onRateBook={null} // Rates directly inside Bookshelf View contexts
          />
        ))}
      </div>
    </div>
  );
}