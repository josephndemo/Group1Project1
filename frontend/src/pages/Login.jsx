import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Lock } from 'lucide-react';

export default function Login({ setUser, setCurrentView }) {
  const [email, setEmail] = useState('user@bookshelf.com'); 
  const [password, setPassword] = useState('UserPass123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5555/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setCurrentView('bookshelf');
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Session secured. Welcome, ${userData.username}!`,
          showConfirmButton: false,
          timer: 2000,
          background: '#ffffff',
          iconColor: '#10b981'
        });
      } else {
        Swal.fire({
          title: 'Authentication Failed',
          text: 'Invalid database credential match encountered.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch {
      Swal.fire('Server Connection Error', 'Ensure backend server node is actively listening on port 5555.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto mt-12 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Sign In</h3>
        <p className="text-xs text-slate-400">Access your personalized hub tracker account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-medium text-slate-600">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-semibold shadow-sm" 
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-semibold shadow-sm" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-colors disabled:opacity-50 tracking-wide mt-2"
        >
          {loading ? 'Authenticating Session...' : 'Authenticate Session'}
        </button>
      </form>
    </div>
  );
}