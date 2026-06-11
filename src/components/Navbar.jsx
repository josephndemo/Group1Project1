import React from 'react';
// 🎯 FIXED: Changed MessageSquareStar to MessageSquare which is available in all versions
import { BookOpen, BookmarkCheck, Heart, Library, MessageSquare } from 'lucide-react';
import icon1 from '../assets/icon1.png'; 

export default function Navbar({ currentView, onViewChange }) {
  return (
    <nav className="navbar">
<div className="navbar-brand">
        <img
          src={icon1}
          alt="Open Library Hub Logo"
          className="nav-logo"
        />
        <span>OpenLibrary Hub</span>
      </div>
      <ul className="navbar-links">
        <li>
          <a href="#home" className={currentView === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onViewChange('home'); }}>
            <Library size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Home
          </a>
        </li>
        <li>
          <a href="#bookshelf" className={currentView === 'bookshelf' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onViewChange('bookshelf'); }}>
            <BookmarkCheck size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> My Bookshelf
          </a>
        </li>
        <li>
          <a href="#favorites" className={currentView === 'favorites' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onViewChange('favorites'); }}>
            <Heart size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Favorites
          </a>
        </li>
        <li>
          <a href="#reviews" className={currentView === 'reviews' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onViewChange('reviews'); }}>
            {/* 🎯 FIXED: Swapped out the icon usage block safely here */}
            <MessageSquare size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Rated & Reviewed
          </a>
        </li>
      </ul>
    </nav>
  );
}