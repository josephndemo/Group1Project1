import React from 'react';
import { BookOpen, BookmarkCheck, Heart, Library, Star } from 'lucide-react';
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
          <a
            href="#home"
            className={currentView === 'home' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onViewChange('home'); }}
          >
            <Library size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Home
          </a>
        </li>
        <li>
          <a
            href="#manageBooks"
            className={currentView === 'manageBooks' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onViewChange('manageBooks'); }}
          >
            <BookOpen size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Manage Books
          </a>
        </li>
        <li>
          <a
            href="#bookshelf"
            className={currentView === 'bookshelf' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onViewChange('bookshelf'); }}
          >
            <BookmarkCheck size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> My Bookshelf
          </a>
        </li>
        <li>
          <a
            href="#book-club"
            className={currentView === 'bookClub' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onViewChange('bookClub'); }}
          >
            <Star size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
            Book Club
          </a>
        </li>
        <li>
          <a
            href="#favorites"
            className={currentView === 'favorites' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onViewChange('favorites'); }}
          >
            <Heart size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Favorites
          </a>
        </li>
      </ul>
    </nav>
  );
}