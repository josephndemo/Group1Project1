import React from 'react';
import { BookOpen, BookmarkCheck, Heart, Library, MessageSquare } from 'lucide-react';

export default function Navbar({ currentView, onViewChange }) {
  const links = [
    { id: 'home', label: 'Home', icon: Library },
    { id: 'bookshelf', label: 'My Bookshelf', icon: BookmarkCheck },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'reviews', label: 'Rated & Reviewed', icon: MessageSquare },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg text-blue-600 cursor-pointer" onClick={() => onViewChange('home')}>
          <BookOpen className="w-6 h-6" />
          <span>OpenLibrary Hub</span>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onViewChange(link.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}