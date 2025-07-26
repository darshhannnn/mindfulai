import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const isAuthenticated = localStorage.getItem('token'); // Simple check for demonstration

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">MindfulAI</h1>
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/journal" className="hover:text-blue-200">Journal</Link></li>
              <li><Link to="/chatbot" className="hover:text-blue-200">Chatbot</Link></li>
              <li><Link to="/mood-visualization" className="hover:text-blue-200">Mood</Link></li>
              <li><Link to="/weekly-reports" className="hover:text-blue-200">Reports</Link></li> {/* New link */}
              <li><a onClick={logout} href="#!" className="cursor-pointer hover:text-blue-200">Logout</a></li>
            </>
          ) : (
            <>
              <li><Link to="/register" className="hover:text-blue-200">Register</Link></li>
              <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
