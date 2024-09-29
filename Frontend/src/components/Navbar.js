import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="shadow-lg bg-[#021526] rounded-b-lg bg-opacity-90">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-[#D1E9F6] transition transform hover:scale-105 hover:text-[#F05941] duration-300"
          >
            SpillTracker
          </Link>
        </div>

        {/* Links Section */}
        <ul className="flex space-x-8">
          <li>
            <Link
              to="/"
              className="text-[#D1E9F6] text-lg hover:text-[#F05941] transition-colors duration-300 hover:underline"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className="text-[#D1E9F6] text-lg hover:text-[#F05941] transition-colors duration-300 hover:underline"
            >
              History
            </Link>
          </li>
          <li>
            <Link
              to="/downloaded-images"
              className="text-[#D1E9F6] text-lg hover:text-[#F05941] transition-colors duration-300 hover:underline"
            >
              Downloaded Images
            </Link>
          </li>
        </ul>

        {/* Auth Button Section */}
        <div>
          <button className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-teal-600 transition-transform transform hover:scale-105 duration-300">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;