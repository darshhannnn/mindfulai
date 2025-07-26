import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Journal = () => {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchEntries();

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = false; 
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setText((prevText) => prevText + transcript + ' ');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
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
    setShowAlert(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/journal', { text }, {
        headers: { 'x-auth-token': token },
      });
      if (res.data.crisisDetected) {
        setShowAlert(true);
      }
      setText('');
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-7 text-gray-800">Journal Your Thoughts</h1>
      
      {showAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-pulse" role="alert">
          <strong className="font-bold">Crisis Alert!</strong>
          <span className="block sm:inline"> We've detected language that may indicate distress. Please reach out for help if you need it.</span>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li>National Suicide Prevention Lifeline: <a href="tel:988" className="underline hover:text-red-900">988</a></li>
            <li>Crisis Text Line: Text HOME to <a href="tel:741741" className="underline hover:text-red-900">741741</a></li>
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 mb-8">
        <div>
          <textarea
            placeholder="Write your thoughts here... or speak them!"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 min-h-[150px] text-lg"
          ></textarea>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex-grow p-3 rounded-lg transition duration-200 transform hover:scale-105 
            ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 ${isListening ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
          >
            {isListening ? '🔴 Stop Listening' : '🎤 Start Speaking'}
          </button>
          <button
            type="submit"
            className="flex-grow bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 transform hover:scale-105"
          >
            Add Entry
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Past Entries</h2>
        {entries.length === 0 && <p className="text-center text-gray-500">No journal entries yet. Start writing or speaking!</p>}
        {entries.map((entry) => (
          <div key={entry._id} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
            <p className="text-gray-700 text-base mb-2">{entry.text}</p>
            {entry.crisisDetected && (
              <p className="text-sm font-bold text-red-600 mb-2">⚠️ Crisis language detected in this entry.</p>
            )}
            <small className="text-gray-500 text-xs flex justify-between items-center">
              <span>Sentiment: <span className="font-medium capitalize">{entry.sentiment}</span> | 
              Mood: <span className="font-medium capitalize">{entry.mood}</span></span>
              <span>Date: {new Date(entry.date).toLocaleString()}</span>
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
