import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Flame, Star } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5555/api/dashboard/analytics', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setMetrics(data.metrics);
          setGenres(data.genre_distribution);
        }
      });
  }, []);

  if (!metrics) return <div className="text-center py-12 text-xs text-slate-400 font-bold">Querying analytics database engine...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reading Metrics & Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated live server database statistics tracking your reading progress.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
          <div><h4 className="text-2xl font-black text-slate-800 leading-none">{metrics.total_books}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Tracked</p></div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Award className="w-5 h-5" /></div>
          <div><h4 className="text-2xl font-black text-slate-800 leading-none">{metrics.completed_books}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p></div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Flame className="w-5 h-5" /></div>
          <div><h4 className="text-2xl font-black text-slate-800 leading-none">{metrics.currently_reading}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Reading</p></div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><Star className="w-5 h-5" /></div>
          <div><h4 className="text-2xl font-black text-slate-800 leading-none">{metrics.average_rating} ★</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Rating</p></div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm max-w-md">
        <h3 className="text-sm font-black text-slate-800 mb-4">Books Read By Genre</h3>
        <div className="space-y-4">
          {genres.length > 0 ? (
            genres.map(g => (
              <div key={g.genre} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{g.genre}</span>
                  <span className="text-slate-800">{g.count} {g.count === 1 ? 'book' : 'books'}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500" style={{ width: `${metrics.total_books > 0 ? (g.count / metrics.total_books) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-slate-400 font-medium py-4">No data to calculate. Add books to your shelf to seed metrics charts.</p>
          )}
        </div>
      </div>
    </div>
  );
}