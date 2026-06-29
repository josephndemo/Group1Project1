import React from 'react';
import { BookOpen, Library, Users, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Navbar({ user, currentView, setCurrentView, setUser }) {
  
  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5555/api/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setUser(null);
        setCurrentView('home');
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Logged out successfully', showConfirmButton: false, timer: 1500 });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* BRAND LOGO */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
          <div className="w-12 h-12 border-slate-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all overflow-hidden">
            <img 
              src="/src/assets/icon1.png" 
              alt="Book Icon" 
              className="w-full h-full object-cover"
            />
          </div>
            <span className="font-black text-lg tracking-tight text-slate-800">
              OpenLibrary<span className="text-blue-600">Hub</span>
            </span>
          </div>

          {/* APPLICATION ROUTING LINKS */}
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentView === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Discover
            </button>

            {/* ONLY SHOW BOOKSHELF IF USER IS LOGGED IN */}
            {user && (
              <button 
                onClick={() => setCurrentView('bookshelf')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentView === 'bookshelf' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Library className="w-3.5 h-3.5" /> My Bookshelf
              </button>
            )}

            {/* BOOK CLUB IS VISIBLE TO EVERYONE (PROMPTS LOGIN IF ANONYMOUS) */}
            <button 
              onClick={() => setCurrentView('bookclub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentView === 'bookclub' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Users className="w-3.5 h-3.5" /> Book Club
            </button>

            {/* ADMIN CONSOLE LINK */}
            {user && user.role === 'admin' && (
              <button 
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentView === 'admin' ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
              </button>
            )}
          </div>

          {/* PROFILE / AUTH SECTION */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">@{user.username}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentView('login')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}