// Menu.js
import React from 'react';

const Menu = ({ menuOpen, searchQuery, setSearchQuery }) => (
  menuOpen && (
    <div className="fixed bottom-16 right-4 bg-white shadow-lg p-4 rounded-lg z-50">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
    </div>
  )
);

export default Menu;
