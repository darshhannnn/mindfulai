import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const isAuthenticated = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">MindfulAI 🧠💚</h1>
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-blue-200 transition duration-300 ease-in-out">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/journal" className="hover:text-blue-200 transition duration-300 ease-in-out">Journal</Link></li>
              <li><Link to="/chatbot" className="hover:text-blue-200 transition duration-300 ease-in-out">Chatbot</Link></li>
              <li><Link to="/mood-visualization" className="hover:text-blue-200 transition duration-300 ease-in-out">Mood</Link></li>
              <li><Link to="/weekly-reports" className="hover:text-blue-200 transition duration-300 ease-in-out">Reports</Link></li>
              <li>
                <a 
                  onClick={logout} 
                  href="#!" 
                  className="cursor-pointer hover:text-blue-200 transition duration-300 ease-in-out"
                >
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/register" className="hover:text-blue-200 transition duration-300 ease-in-out">Register</Link></li>
              <li><Link to="/login" className="hover:text-blue-200 transition duration-300 ease-in-out">Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
