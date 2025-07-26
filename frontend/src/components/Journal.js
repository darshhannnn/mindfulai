import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Journal = () => {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/journal', {
        headers: { 'x-auth-token': token },
      });
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/journal', { text }, {
        headers: { 'x-auth-token': token },
      });
      setText('');
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Journal</h1>
      <form onSubmit={onSubmit} className="space-y-4 mb-8">
        <div>
          <textarea
            placeholder="Write your thoughts here..."
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Add Entry
        </button>
      </form>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-2">{entry.text}</p>
            <small className="text-gray-500 text-sm">
              Sentiment: <span className="font-medium">{entry.sentiment}</span> | 
              Mood: <span className="font-medium">{entry.mood}</span> | 
              Date: {new Date(entry.date).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
