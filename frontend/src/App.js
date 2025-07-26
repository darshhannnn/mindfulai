import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Journal from './components/Journal';
import Chatbot from './components/Chatbot';
import MoodVisualization from './components/MoodVisualization';
import WeeklyReports from './components/WeeklyReports'; // Import new component
import PrivateRoute from './components/PrivateRoute';

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/journal" element={<PrivateRoute component={Journal} />} />
            <Route path="/chatbot" element={<PrivateRoute component={Chatbot} />} />
            <Route path="/mood-visualization" element={<PrivateRoute component={MoodVisualization} />} />
            <Route path="/weekly-reports" element={<PrivateRoute component={WeeklyReports} />} /> {/* New route */}
            <Route path="/" element={<h1 className="text-3xl font-bold text-center text-blue-600">Welcome to MindfulAI</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
