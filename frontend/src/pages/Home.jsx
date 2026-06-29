import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BookOpen, BarChart3, CheckCircle2, Bookmark, Award, HelpCircle } from 'lucide-react';

export default function Home({ user, setCurrentView }) {
  const [books, setBooks] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // 1. Fetch available books catalog
    fetch('http://localhost:5555/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error loading library items:", err));

    // 2. Fetch analytics summary metrics if logged in
    if (user) {
      fetch('http://localhost:5555/api/dashboard/analytics', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => setAnalytics(data))
        .catch(err => console.error("Error loading metrics:", err));
    }
  }, [user]);

  const handleAddToShelf = async (bookId) => {
    if (!user) {
      Swal.fire('Session Needed', 'Please sign in to save books to your personal shelf.', 'info');
      setCurrentView('login');
      return;
    }

    const res = await fetch('http://localhost:5555/api/bookshelf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, status: 'Want to Read' }),
      credentials: 'include'
    });

    if (res.ok) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Added to Bookshelf!', showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire('Notice', 'This book is already on your shelf.', 'warning');
    }
  };

  return (
    <div className="space-y-10">
      
      {/* HERO SECTION CONTAINER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Welcome back</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Your Digital Sanctuary For Literary Progress.</h1>
          <p className="text-xs text-blue-100 font-medium leading-relaxed">Track real-time completion analytics, join discussion channels with active readers, and organize your home library shelf structures.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
          <BookOpen className="w-96 h-96" />
        </div>
      </div>

      {/* DYNAMIC ANALYTICS STRIP SECTION */}
      {user && analytics && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" /> Reading Engine Metrics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-black text-slate-800">{analytics.metrics.total_books}</p>
                <p className="text-[11px] font-bold text-slate-400">Total Tracked</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-black text-slate-800">{analytics.metrics.completed_books}</p>
                <p className="text-[11px] font-bold text-slate-400">Completed</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Bookmark className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-black text-slate-800">{analytics.metrics.currently_reading}</p>
                <p className="text-[11px] font-bold text-slate-400">In Progress</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Award className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-black text-slate-800">{analytics.genre_distribution?.length || 0}</p>
                <p className="text-[11px] font-bold text-slate-400">Genres Explored</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CATALOG CATALOG GRID VIEW */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">Explore Central Catalog</h3>
          <p className="text-xs text-slate-400 mt-0.5">Discover books available inside the community hub architecture.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <div key={book.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-3">
                <div className="aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden relative">
                  <img 
                    src={book.cover_image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wide">
                    {book.genre}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 truncate">{book.title}</h4>
                  <p className="text-xs text-slate-400 font-semibold truncate">by {book.author}</p>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{book.description || "No index log data summary currently logged for this catalog entry item."}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 font-semibold">{book.total_pages} pages</span>
                <button 
                  onClick={() => handleAddToShelf(book.id)}
                  className="text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  + Add to Shelf
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}