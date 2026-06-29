import React from 'react';
import { BookmarkPlus, Calendar, Layers } from 'lucide-react';

export default function BookCard({ book, onAddShelf, isAuthenticated }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex flex-col group transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
        <img 
          src={book.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-sm tracking-wider">
          {book.genre}
        </span>
      </div>

      <div className="pt-3 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{book.title}</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">by {book.author}</p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Calendar className="w-3 h-3 text-slate-300" /> {book.publication_year || 'N/A'}
          </span>
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Layers className="w-3 h-3 text-slate-300" /> {book.total_pages}p
          </span>
          
          {isAuthenticated && (
            <button 
              onClick={() => onAddShelf(book.id)} 
              className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
}