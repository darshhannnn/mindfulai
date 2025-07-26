import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatWindowRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Initialize Socket.io connection
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
    // Scroll to the bottom of the chat window on new messages
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
    if (!message.trim()) return; // Prevent sending empty messages

    // Emit message via socket.io instead of HTTP POST
    if (socket.current) {
      // Optimistically add user message to history
      const userMessage = { text: message, isUser: true, date: new Date().toISOString() };
      setChatHistory((prev) => [...prev, userMessage]);
      socket.current.emit('sendMessage', message); 
      setMessage('');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10 flex flex-col h-[600px]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Chatbot</h1>
      
      <div ref={chatWindowRef} className="flex-grow overflow-y-auto border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 space-y-3">
        {chatHistory.map((msg) => (
          <div 
            key={msg._id || Math.random()} 
            className={`p-3 rounded-lg shadow-sm max-w-[80%] ${msg.isUser ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-200 self-start mr-auto'}`}
          >
            <p className="text-sm text-gray-800">{msg.text}</p>
            <small className="text-xs text-gray-500 block mt-1">{new Date(msg.date).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex space-x-3">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
