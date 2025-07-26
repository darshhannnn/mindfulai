import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeeklyReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchWeeklyReports();
  }, []);

  const fetchWeeklyReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reports/weekly', {
        headers: { 'x-auth-token': token },
      });
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching weekly reports:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Weekly Reports</h1>
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.date} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Report for {report.date}</h2>
              <p><span className="font-medium">Average Sentiment:</span> {report.averageSentiment}</p>
              <p><span className="font-medium">Most Common Mood:</span> {report.topMood}</p>
              <p><span className="font-medium">Entries this day:</span> {report.entryCount}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No weekly report data available. Start journaling to see your trends!</p>
      )}
    </div>
  );
};

export default WeeklyReports;
