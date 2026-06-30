import React from 'react';
import { BookOpen, BookmarkCheck, Heart, Library, Star, MessageSquareText } from 'lucide-react';
import icon1 from '../assets/icon1.png';

export default function Navbar({ currentView, onViewChange }) {
 const links = [
  { key: 'home', href: '#home', label: 'Home', Icon: Library },
  { key: 'manageBooks', href: '#manageBooks', label: 'Manage Books', Icon: BookOpen },
  { key: 'bookshelf', href: '#bookshelf', label: 'My Bookshelf', Icon: BookmarkCheck },
  { key: 'bookClub', href: '#book-club', label: 'Book Club', Icon: Star },
  { key: 'myReviews', href: '#my-reviews', label: 'My Reviews', Icon: MessageSquareText },
  { key: 'favorites', href: '#favorites', label: 'Favorites', Icon: Heart },
 ];

 return (
  <nav className="navbar">
   <div className="navbar-brand">
    <img src={icon1} alt="Open Library Hub Logo" className="nav-logo" />
    <span>OpenLibrary Hub</span>
   </div>

   <ul className="navbar-links">
    {links.map(({ key, href, label, Icon }) => (
     <li key={key}>
      <a
       href={href}
       className={currentView === key ? 'active' : ''}
       onClick={(e) => {
        e.preventDefault();
        onViewChange(key);
       }}
      >
       <Icon size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> {label}
      </a>
     </li>
    ))}
   </ul>
  </nav>
 );
}
