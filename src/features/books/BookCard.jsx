import React, { useState } from 'react';
import { Bookmark, Heart, Star } from 'lucide-react';

export default function BookCard({ 
  book, onSelect, onToggleBookshelf, onToggleFavorite, isBookshelf, isFavorite, 
  showRating, onRateBook, showStatus, onStatusChange, showComment, onAddComment 
}) {
  const [localText, setLocalText] = useState('');

  const handleRating = (e, ratingValue) => {
    e.stopPropagation();
    if (onRateBook) onRateBook(book.id, ratingValue);
  };

  const handleSaveComment = (e) => {
    e.stopPropagation();
    if (!localText.trim()) return;
    if (onAddComment) onAddComment(book.id, localText.trim());
    setLocalText('');
  };

  return (
    <div 
      className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer group"
      onClick={() => onSelect(book)}
    >
      <div className="relative bg-slate-100 pt-[125%] overflow-hidden w-full">
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy" 
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow mb-4">
          <h3 className="font-semibold text-base text-slate-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-2">By {book.author}</p>
          
          {showStatus && (
            <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <select 
                className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={book.status || 'in progress'}
                onChange={(e) => onStatusChange(book.id, e.target.value)}
              >
                <option value="in progress">In Progress</option>
                <option value="read">Read</option>
              </select>
            </div>
          )}

          {showRating && (
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`p-0.5 transition-colors ${
                    (book.rating || 0) >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'
                  }`}
                  onClick={(e) => handleRating(e, star)}
                >
                  <Star size={16} fill={(book.rating || 0) >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          )}
        </div>

        {showComment && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-sans"
                rows="2"
                placeholder="Type details, quotes, or key takeaways..."
                value={localText}
                onChange={(e) => setLocalText(e.target.value)}
              />
              <button 
                className="self-end px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 shadow-sm transition-colors"
                onClick={handleSaveComment}
                disabled={!localText.trim()}
              >
                Save Note
              </button>
            </div>

            {book.comments && book.comments.length > 0 && (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1 border-t border-dashed border-slate-100 pt-3">
                {book.comments.map((item) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl border-l-2 border-l-blue-500">
                    <p className="text-xs text-slate-600 leading-normal break-words">{item.text}</p>
                    <span className="block text-[10px] text-slate-400 text-right mt-1.5">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-400 font-medium mb-4 mt-auto">
          Published: {book.year}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
          <button 
            className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isBookshelf 
                ? 'bg-blue-50 text-blue-600' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleBookshelf(book); }}
          >
            <Bookmark size={13} fill={isBookshelf ? "currentColor" : "none"} />
            <span>{isBookshelf ? 'Saved' : 'Shelf'}</span>
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isFavorite 
                ? 'bg-rose-50 text-rose-600' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book); }}
          >
            <Heart size={13} fill={isFavorite ? "currentColor" : "none"} />
            <span>{isFavorite ? 'Liked' : 'Favorite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}