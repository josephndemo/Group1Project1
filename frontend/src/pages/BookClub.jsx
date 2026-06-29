import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { MessageSquare, MessageCircle, Send, User, Bookmark, CheckCircle2, Layers, BookOpen } from 'lucide-react';

export default function BookClub({ user }) {
  const [books, setBooks] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [myShelfItems, setMyShelfItems] = useState([]);
  const [activeBookId, setActiveBookId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Master Channels, Active Feeds, and Personal Shelf Items
  const loadDataChannels = () => {
    const fetchTargets = [
      fetch('http://localhost:5555/api/books').then(res => res.json()),
      fetch('http://localhost:5555/api/comments').then(res => res.json())
    ];

    // Append personalized shelf indices if an active session exists
    if (user) {
      fetchTargets.push(
        fetch('http://localhost:5555/api/bookshelf', { credentials: 'include' }).then(res => res.json())
      );
    }

    Promise.all(fetchTargets)
      .then(([booksData, commentsData, shelfData]) => {
        setBooks(booksData);
        setAllComments(commentsData);
        if (shelfData && shelfData.data) {
          // Filter out only items that are In Progress ('Reading') or 'Completed'
          const activeTracks = shelfData.data.filter(item => 
            item.status === 'Reading' || item.status === 'Completed'
          );
          setMyShelfItems(activeTracks);
        }

        // Default set the active channel view pointer if not already locked
        if (!activeBookId && booksData.length > 0) {
          setActiveBookId(booksData[0].id);
        }
      })
      .catch(err => console.error("Error gathering core channel streams:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDataChannels();
  }, [user]);

  const getCommentCountForBook = (bookId) => {
    return allComments.filter(c => c.book_id === bookId).length;
  };

  // Filter lists to map active streams cleanly
  const booksWithComments = books.filter(b => getCommentCountForBook(b.id) > 0);
  const displayedComments = allComments.filter(c => c.book_id === activeBookId);
  const activeBookDetails = books.find(b => b.id === activeBookId);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeBookId) return;

    const res = await fetch('http://localhost:5555/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: activeBookId, text: commentText }),
      credentials: 'include'
    });

    if (res.ok) {
      setCommentText('');
      // Refresh only the comment cache vector to avoid full panel blinking animations
      fetch('http://localhost:5555/api/comments')
        .then(res => res.json())
        .then(data => setAllComments(data));
        
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Note shared to group!', showConfirmButton: false, timer: 1200 });
    } else {
      Swal.fire('Error', 'Could not save note data structures.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-xs font-bold text-slate-300 animate-pulse">Syncing club architecture matrix...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT PANEL COLUMN: NAVIGATION PLATFORMS & SHELF METRICS */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* PANEL NEW FEATURE: BOOKS IN PROGRESS & COMPLETED TRACKER */}
        {user && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> My Reading Status
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Click any item below to jump directly into its live forum feed.</p>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {myShelfItems.length > 0 ? (
                myShelfItems.map(item => {
                  const b = item.book || {};
                  const isSelected = b.id === activeBookId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveBookId(b.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={b.cover_image} alt="" className="w-7 h-10 object-cover rounded shadow-2xs shrink-0" />
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{b.title}</p>
                          <p className={`text-[10px] font-medium truncate ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>by {b.author}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide shrink-0 ml-2 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'Reading' ? 'Reading' : 'Done'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  No books marked as Reading or Completed yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPREHENSIVE FEED CHANNELS TRACKER */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="text-slate-700 w-3.5 h-3.5" /> General Discussions
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Browse active discussion loops.</p>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {booksWithComments.map(book => {
              const count = getCommentCountForBook(book.id);
              const isActive = book.id === activeBookId;
              return (
                <div 
                  key={book.id}
                  onClick={() => setActiveBookId(book.id)}
                  className={`p-2.5 rounded-xl border flex gap-3 items-center cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-400/5' 
                      : 'bg-white border-slate-100 hover:bg-slate-50/60'
                  }`}
                >
                  <img src={book.cover_image} alt="" className="w-8 h-11 object-cover rounded shadow-2xs border border-slate-100 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs text-slate-800 truncate">{book.title}</h4>
                    <div className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-0.5">
                      <MessageCircle className="w-2.5 h-2.5" /> {count} {count === 1 ? 'note' : 'notes'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT PANEL COLUMN: CENTRAL LIVE FEED CONTAINER WITH COVER HERO HEADER */}
      <div className="lg:col-span-2 space-y-6">
        {activeBookDetails ? (
          <>
            {/* DISCUSSION FEED HERO HEADER WITH BOOK COVER IMAGE */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-20 h-28 bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-100 shrink-0 mx-auto sm:mx-0">
                <img 
                  src={activeBookDetails.cover_image} 
                  alt={activeBookDetails.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="text-[9px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded uppercase tracking-wider">{activeBookDetails.genre}</span>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeBookDetails.title}</h2>
                <p className="text-xs text-slate-400 font-semibold">Discussion moderated by community readers • Written by {activeBookDetails.author}</p>
              </div>
            </div>

            {/* LIVE CONVERSATION STREAM */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-slate-500" /> Live Feed Stream
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">{displayedComments.length} entries total</span>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {displayedComments.length > 0 ? (
                  displayedComments.map(comment => (
                    <div key={comment.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <User className="w-3 h-3" />
                          </div>
                          @{comment.username}
                        </div>
                        <span className="text-slate-400 font-semibold">{comment.created_at}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 border border-dashed rounded-xl p-6 text-slate-400 text-xs font-bold bg-slate-50/20">
                    No conversation points shared here yet. Use the composition block below to open discussion.
                  </div>
                )}
              </div>

              {/* INPUT BOX INTEGRATED DIRECTLY AT THE FOOTER OF THE FEED CHANNEL */}
              <div className="border-t border-slate-50 pt-4">
                {user ? (
                  <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <textarea 
                        rows="2"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder={`Share your insights, progress notes, or questions regarding "${activeBookDetails.title}"...`}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-semibold placeholder:text-slate-400 resize-none bg-slate-50/30 focus:bg-white transition-all"
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-sm h-fit transition-all flex items-center gap-1.5 shrink-0">
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center text-xs font-semibold text-slate-400">
                    Sign in to participate in book club discussions.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-24 text-center shadow-xs text-slate-400 text-xs font-bold">
            Select an active channel thread or tracking card from the sidebar to open discussion maps.
          </div>
        )}
      </div>

    </div>
  );
}