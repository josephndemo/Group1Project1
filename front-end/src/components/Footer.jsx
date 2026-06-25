import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} OpenLibrary Hub. All rights reserved.</p>
        <p className="footer-subtext">Data sourced fluidly via Open Library Open Source API.</p>
      </div>
    </footer>
  );
}