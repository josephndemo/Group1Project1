const BASE_URL = 'https://openlibrary.org/search.json';
const ITEMS_PER_PAGE = 30;

export const fetchBooks = async (query = 'classic literature', page = 1) => {
  try {
    const apiPage = Math.ceil((page * ITEMS_PER_PAGE) / 100);
    
    // Fix: Explicitly ask ONLY for fields our app renders to prevent 500 payload errors
    const targetFields = 'key,title,author_name,first_publish_year,cover_i,publisher,isbn,subject';
    
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&page=${apiPage}&fields=${targetFields}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Good citizenship header: Helps the API prioritize your application requests
        'User-Agent': 'MyLibraryApp/1.0.0 (contact: josephndemo@gmail.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned error state: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Defensive check: If the API sends back an empty data structure or errors out silently
    if (!data.docs) {
      return { books: [], totalResults: 0 };
    }

    const startIndex = ((page - 1) * ITEMS_PER_PAGE) % 100;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedDocs = data.docs.slice(startIndex, endIndex);

    return {
      books: paginatedDocs.map((book) => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
        year: book.first_publish_year || 'N/A',
        coverUrl: book.cover_i 
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
          : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        publisher: book.publisher ? book.publisher[0] : 'N/A',
        isbn: book.isbn ? book.isbn[0] : null,
        subjects: book.subject ? book.subject.slice(0, 5) : []
      })),
      totalResults: data.numFound || 0
    };
  } catch (error) {
    console.error("Network interface error uncovered:", error);
    throw error;
  }
};