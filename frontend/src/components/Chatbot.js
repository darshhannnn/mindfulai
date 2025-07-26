import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatWindowRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socket.current = io('http://localhost:5000', {
        auth: {
          token: token,
        },
      });

      socket.current.on('connect', () => {
        console.log('Connected to socket.io');
      });

      socket.current.on('chatMessage', (msg) => {
        setChatHistory((prev) => [...prev, msg]);
      });

      socket.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      socket.current.on('error', (err) => {
        console.error('Socket error:', err);
      });
    }

    fetchChatHistory();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/chatbot', {
        headers: { 'x-auth-token': token },
      });
      setChatHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (socket.current) {
      const userMessage = { text: message, isUser: true, date: new Date().toISOString() };
      setChatHistory((prev) => [...prev, userMessage]);
      socket.current.emit('sendMessage', message); 
      setMessage('');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 flex flex-col h-[600px]">
      <h1 className="text-3xl font-extrabold text-center mb-7 text-gray-800">Chat with MindfulAI</h1>
      
      <div ref={chatWindowRef} className="flex-grow overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50 space-y-4 shadow-inner">
        {chatHistory.length === 0 && <p className="text-center text-gray-500 italic">Start a conversation!</p>}
        {chatHistory.map((msg) => (
          <div 
            key={msg._id || Math.random()} 
            className={`p-3 rounded-lg shadow-sm max-w-[85%] transition duration-300 ease-in-out 
              ${msg.isUser ? 'bg-blue-100 self-end ml-auto text-blue-800' : 'bg-gray-200 self-start mr-auto text-gray-700'}`}
          >
            <p className="text-sm mb-1">{msg.text}</p>
            <small className="text-xs opacity-75 block text-right">{new Date(msg.date).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex space-x-3 mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 transform hover:scale-105"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
