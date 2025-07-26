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

      const sentimentMapping = {
        'very negative': -2,
        'negative': -1,
        'neutral': 0,
        'positive': 1,
        'very positive': 2,
      };

      entries.sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = entries.map(entry => new Date(entry.date).toLocaleDateString());
      const data = entries.map(entry => sentimentMapping[entry.sentiment] !== undefined ? sentimentMapping[entry.sentiment] : 0); // Default to neutral if sentiment not mapped

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sentiment Over Time',
            data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3, // Add some curve to the line
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgb(75, 192, 192)',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      });

    } catch (err) {
      console.error('Error fetching journal entries for visualization:', err);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Your Emotional Trends',
        font: {
          size: 20,
          weight: 'bold',
        },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const sentimentLabels = Object.keys(sentimentMapping).find(key => sentimentMapping[key] === value);
            return `Sentiment: ${sentimentLabels || 'N/A'}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyFont: {
          size: 14,
        },
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
        y: {
            min: -2,
            max: 2,
            ticks: {
                callback: function(value, index, values) {
                    const labels = Object.keys(sentimentMapping).find(key => sentimentMapping[key] === value);
                    return labels || '';
                },
                font: {
                    size: 12,
                },
                color: '#666',
            },
            grid: {
                color: '#e0e0e0',
            }
        },
        x: {
            ticks: {
                font: {
                    size: 12,
                },
                color: '#666',
            },
            grid: {
                display: false,
            }
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-7 text-gray-800">Your Emotional Trends</h1>
      <div className="h-[400px] w-full">
        {chartData.labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-center text-gray-600 text-lg mt-20">No journal entries to display mood data. Start by adding some entries!</p>
        )}
      </div>
    </div>
  );
};

export default MoodVisualization;
