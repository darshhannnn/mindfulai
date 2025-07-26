import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodVisualization = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/journal', {
        headers: { 'x-auth-token': token },
      });

      const entries = res.data;

      // Process data for Chart.js
      // For simplicity, let's map sentiment to a numerical value:
      // 'positive': 2, 'neutral': 1, 'negative': 0
      const sentimentMapping = {
        'positive': 2,
        'neutral': 1,
        'negative': 0,
        'very positive': 3,
        'very negative': -1,
      };

      // Sort entries by date ascending
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = entries.map(entry => new Date(entry.date).toLocaleDateString());
      const data = entries.map(entry => sentimentMapping[entry.sentiment] !== undefined ? sentimentMapping[entry.sentiment] : 1); // Default to neutral if sentiment not mapped

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sentiment Over Time',
            data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });

    } catch (err) {
      console.error('Error fetching journal entries for visualization:', err);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Emotional Trends',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const sentimentLabels = Object.keys(sentimentMapping).find(key => sentimentMapping[key] === value);
            return `Sentiment: ${sentimentLabels || 'N/A'}`;
          }
        }
      }
    },
    scales: {
        y: {
            min: -1,
            max: 3,
            ticks: {
                callback: function(value, index, values) {
                    const labels = Object.keys(sentimentMapping).filter(key => sentimentMapping[key] === value);
                    return labels.length > 0 ? labels[0] : '';
                }
            }
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Mood Visualization</h1>
      {chartData.labels.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-600">No journal entries to display mood data. Start by adding some entries!</p>
      )}
    </div>
  );
};

export default MoodVisualization;
