import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BookOpen, CheckCircle, Bookmark, Percent, PlusCircle, ChevronRight } from 'lucide-react';

export default function MyBookshelf({ user }) {
  const [shelfItems, setShelfItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchShelf = () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch user's bookshelf records from the backend database
    fetch('http://localhost:5555/api/bookshelf', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { data: [] })
      .then(resData => {
        setShelfItems(resData.data || []);
      })
      .catch(err => console.error("Error connecting to shelf channel:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShelf();
  }, [user]);

  // Handle manual progress adjustments using a sweetalert numeric field wrapper
  const handleUpdateProgress = async (itemId, currentProgressPage, totalPages, currentStatus) => {
    const { value: newPage } = await Swal.fire({
      title: 'Update Reading Progress',
      text: `Enter your current page out of ${totalPages}:`,
      input: 'number',
      inputValue: currentProgressPage,
      inputAttributes: {
        min: 0,
        max: totalPages,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: 'Save Progress',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value || isNaN(value)) {
          return 'Please enter a valid page number.';
        }
        if (parseInt(value) > totalPages) {
          return `Progress cannot exceed the book's total pages (${totalPages}).`;
        }
        if (parseInt(value) < 0) {
          return 'Page number cannot be negative.';
        }
      }
    });

    if (newPage !== undefined) {
      const pageNum = parseInt(newPage);
      
      // Determine base payload payload requirements
      const payload = { current_page: pageNum };
      
      // Automatically shift status parameters to Reading if pages progress past 0
      if (pageNum > 0 && pageNum < totalPages && currentStatus === 'Want to Read') {
        payload.status = 'Reading';
      }

      try {
        const res = await fetch(`http://localhost:5555/api/bookshelf/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        if (res.ok) {
          fetchShelf(); // Reload active view records
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Progress updated!', showConfirmButton: false, timer: 1500 });
        } else {
          const errorData = await res.json();
          Swal.fire('Error', errorData.error || 'Failed to update database schema.', 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Network connectivity bottleneck encountered.', 'error');
      }
    }
  };

  // Filter shelf items locally matching selected navigation tabs
  const filteredItems = shelfItems.filter(item => {
    if (activeTab === 'All') return true;
    return item.status === activeTab;
  });

  if (!user) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto mt-12">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-black text-slate-800">Authentication Required</h3>
        <p className="text-xs text-slate-400 mt-1">Authenticate your log profile parameters to display personal bookshelf data blocks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER META META WRAPPER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Bookshelf</h2>
          <p className="text-xs text-slate-400 mt-0.5">Organize reading queues and update completion analytics parameters.</p>
        </div>

        {/* CONTROLLER NAVIGATION BAR TABS */}
        <div className="bg-white border border-slate-100 p-1 rounded-xl shadow-xs flex gap-1 self-start sm:self-auto">
          {['All', 'Want to Read', 'Reading', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC CARDS GRID LAYOUT CONTAINER */}
      {loading ? (
        <div className="text-center py-24 text-xs font-bold text-slate-300 animate-pulse">Syncing personal bookshelf array...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const book = item.book || {};
            return (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
                
                <div className="space-y-4">
                  {/* ARTWORK AND BADGE HOOK CONTAINER */}
                  <div className="aspect-[4/5] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative">
                    <img 
                      src={book.cover_image} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                    <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm uppercase tracking-wider ${
                      item.status === 'Completed' ? 'bg-green-600' : item.status === 'Reading' ? 'bg-amber-500' : 'bg-slate-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* INFO SPECIFICATION LOGS */}
                  <div>
                    <h4 className="font-black text-sm text-slate-800 line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-slate-400 font-semibold truncate">by {book.author}</p>
                  </div>

                  {/* PROGRESS GAUGE SLIDER STRIP */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">{item.current_page} / {book.total_pages} pages</span>
                      <span className="text-blue-600 flex items-center gap-0.5"><Percent className="w-2.5 h-2.5" /> {item.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-1.5 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(item.completion_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 👇 MODIFIED UTILITY CONTROLLER FOOTER ROW */}
                <div className="pt-4 mt-4 border-t border-slate-50">
                  <button
                    onClick={() => handleUpdateProgress(item.id, item.current_page, book.total_pages, item.status)}
                    className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-600 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Update Progress <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed rounded-2xl bg-white p-8 max-w-sm mx-auto text-slate-400 text-xs font-bold">
          No books logged matching this tab view status index.
        </div>
      )}

    </div>
  );
}