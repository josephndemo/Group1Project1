import { BookOpen, BookmarkCheck, Heart, Library, Star } from 'lucide-react';
import icon1 from '../assets/icon1.png';

export default function Navbar({ currentView, onViewChange, user, onLogout }) {
 const allLinks = [
  { key: 'home', href: '#home', label: 'Home', Icon: Library },
  { key: 'manageBooks', href: '#manageBooks', label: 'Manage Books', Icon: BookOpen },
  { key: 'bookshelf', href: '#bookshelf', label: 'My Bookshelf', Icon: BookmarkCheck },
  { key: 'bookClub', href: '#book-club', label: 'Book Club', Icon: Star },
  { key: 'favorites', href: '#favorites', label: 'Favorites', Icon: Heart },
 ];

 const links = user?.role === 'admin'
  ? allLinks
  : allLinks.filter((link) => link.key !== 'manageBooks');

 const displayName = user?.username || user?.email || 'User';
 const roleLabel = user?.role === 'admin' ? 'Admin' : 'Reader';

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

    <div className="navbar-user-panel">
     <div className="navbar-user-meta">
      <span className="navbar-user-name">{displayName}</span>
      <span className="navbar-user-role">{roleLabel}</span>
     </div>
     <button type="button" className="navbar-logout-btn" onClick={onLogout}>Logout</button>
    </div>
  </nav>
 );
}
