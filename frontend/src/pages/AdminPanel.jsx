import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ShieldAlert, PlusCircle, Trash2, BookOpen, Image, Calendar, Hash, FileText } from 'lucide-react';

export default function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State Vectors
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(''); // 👈 NEW STATE FOR COVER IMAGE URL
  const [publicationYear, setPublicationYear] = useState('2026');
  const [totalPages, setTotalPages] = useState('100');

  const fetchBooks = () => {
    setLoading(true);
    fetch('http://localhost:5555/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error loading admin catalog:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim()) return;

    const payload = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      description: description.trim(),
      cover_image: coverImage.trim() || null, // 👈 APART OF THE INVENTORY DISPATCH PAYLOAD
      publication_year: parseInt(publicationYear) || 2026,
      total_pages: parseInt(totalPages) || 100
    };

    const res = await fetch('http://localhost:5555/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (res.ok) {
      // Clear all text input values upon success
      setTitle('');
      setAuthor('');
      setGenre('');
      setDescription('');
      setCoverImage(''); // 👈 CLEAR UPON SUCCESS
      setPublicationYear('2026');
      setTotalPages('100');
      
      fetchBooks(); // Reload current registry arrays
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Inventory record appended!', showConfirmButton: false, timer: 1500 });
    } else {
      const errorData = await res.json();
      Swal.fire('Access Denied', errorData.error || 'Failed to execute administrative update.', 'error');
    }
  };

  const handleDeleteBook = async (bookId) => {
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: "Dropping this book from database storage will completely purge all related bookshelf instances and comment arrays!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmation.isConfirmed) {
      const res = await fetch(`http://localhost:5555/api/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        fetchBooks();
        Swal.fire('Deleted!', 'Book structure dropped clean from database storage grid.', 'success');
      } else {
        Swal.fire('Error', 'Failed to remove requested resource entry maps.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ShieldAlert className="text-amber-500 w-6 h-6" /> Core Administration Console
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Append fresh community library inventory nodes or drop deprecated resource entries.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COMPONENT: CREATION FORM ELEMENT PANEL */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs xl:col-span-1 space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <PlusCircle className="text-blue-600 w-4 h-4" /> Append Master Record
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Populate text properties below to serialize a new book file entry.</p>
          </div>

          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-xs font-bold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Book Title</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Clean Code" required
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Author Name</label>
                <input 
                  type="text" value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder="e.g. Robert C. Martin" required
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">Genre Classification</label>
                  <input 
                    type="text" value={genre} onChange={e => setGenre(e.target.value)}
                    placeholder="e.g. Technology" required
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">Total Pages</label>
                  <div className="relative flex items-center">
                    <input 
                      type="number" value={totalPages} onChange={e => setTotalPages(e.target.value)}
                      min="1" required
                      className="w-full border border-slate-200 rounded-xl p-2.5 pl-8 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30"
                    />
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 👇 NEW FEATURE PANEL FIELD: IMAGE COVER LINK */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Image className="w-3 h-3 text-slate-400" /> Cover Artwork Image URL
                </label>
                <input 
                  type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/... or leave blank for default"
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30 text-slate-600 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Publication Year</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" value={publicationYear} onChange={e => setPublicationYear(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 pl-8 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Abstract Description Summary</label>
                <textarea 
                  rows="3" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Provide an overview index snippet of the book content themes..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/30 resize-none"
                ></textarea>
              </div>

            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5">
              + Commit Inventory Node
            </button>
          </form>
        </div>

        {/* RIGHT COMPONENT: REAL-TIME CATALOG INVENTORY DIRECTORY LIST */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs xl:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <BookOpen className="text-slate-600 w-4 h-4" /> Global Catalog Directory
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time status of all catalog entities inside the community database storage maps.</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs font-bold text-slate-300 animate-pulse">Syncing core schema registry inventories...</div>
          ) : (
            <div className="overflow-x-auto border border-slate-50 rounded-xl max-h-[550px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Cover Image Preview</th>
                    <th className="p-3.5">Book Metadata Information</th>
                    <th className="p-3.5">Genre Classification</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {books.length > 0 ? (
                    books.map(book => (
                      <tr key={book.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3.5">
                          {/* PREVIEW CONTAINER LOGIC VERIFICATION CHECK */}
                          <img 
                            src={book.cover_image} 
                            alt="" 
                            className="w-9 h-12 object-cover rounded shadow-2xs bg-slate-100 border border-slate-100/50"
                          />
                        </td>
                        <td className="p-3.5 max-w-[240px]">
                          <p className="font-black text-slate-800 truncate">{book.title}</p>
                          <p className="text-slate-400 text-[11px] font-semibold truncate">by {book.author} ({book.publication_year})</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold tracking-tight">{book.total_pages} pages total</p>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                            {book.genre}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                            title="Drop Asset record from schema matrix grid"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-slate-400 font-bold">
                        Central library database storage grid currently contains zero item rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
