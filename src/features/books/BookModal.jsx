import React from 'react';
import { X, Calendar, User, Hash } from 'lucide-react';

export default function BookModal({ book, onClose }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="w-full md:w-2/5 bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-40 md:w-full object-cover rounded-xl shadow-md"
          />
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-2">{book.title}</h2>
          <p className="text-sm font-semibold text-blue-600 mb-6">By {book.author}</p>

          <div className="space-y-4 mb-6 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-400" />
              <span><strong>Published Year:</strong> {book.year || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-slate-400" />
              <span><strong>OpenLibrary ID:</strong> <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">{book.id}</code></span>
            </div>
          </div>

          {book.subjects && book.subjects.length > 0 && (
            <div className="mt-auto">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Categories</h4>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {book.subjects.slice(0, 12).map((subject, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}