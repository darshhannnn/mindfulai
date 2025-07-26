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
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-7 text-gray-800">Your Weekly Reports</h1>
      {reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.date} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
              <h2 className="text-xl font-bold text-blue-700 mb-3">Report for {report.date}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                <p><span className="font-semibold">Average Sentiment:</span> <span className="capitalize">{report.averageSentiment}</span></p>
                <p><span className="font-semibold">Most Common Mood:</span> <span className="capitalize">{report.topMood}</span></p>
                <p><span className="font-semibold">Entries this day:</span> {report.entryCount}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-10">No weekly report data available. Start journaling to see your trends!</p>
      )}
    </div>
  );
};

export default WeeklyReports;
