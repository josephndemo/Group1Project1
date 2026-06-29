import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import MyBookshelf from './pages/MyBookshelf.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import BookClub from './pages/BookClub.jsx'; // 👈 NEW IMPORT LINK
import Login from './pages/Login.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    fetch('http://localhost:5555/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
      <Navbar user={user} currentView={currentView} setCurrentView={setCurrentView} setUser={setUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <Home user={user} setCurrentView={setCurrentView} />}
        {currentView === 'bookshelf' && <MyBookshelf user={user} />}
        {currentView === 'admin' && <AdminPanel />}
        {currentView === 'bookclub' && <BookClub user={user} />} {/* 👈 VIEW CONTROLLER RENDERER */}
        {currentView === 'login' && <Login setUser={setUser} setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
}