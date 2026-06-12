import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 mt-20 text-center text-sm text-slate-400 font-medium">
      &copy; {new Date().getFullYear()} OpenLibrary Hub. Driven by Open Library API Data Engine.
    </footer>
  );
}