import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since we're bypassing authentication, we'll use mock data
    const mockUserData = {
      name: 'Demo User',
      email: 'demo@example.com',
      mentalHealthScore: 75,
      createdAt: new Date().toISOString()
    };
    
    setUserData(mockUserData);
    setLoading(false);
  }, []);

  // Sample data for the mental health trend chart
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Mental Health Score',
        data: [65, 70, 68, userData?.mentalHealthScore || 70],
        borderColor: 'rgb(74, 144, 226)',
        backgroundColor: 'rgba(74, 144, 226, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mental Health Trend',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {userData?.name || 'User'}</h1>
          <button onClick={() => auth.signOut()} className="secondary">Sign Out</button>
        </div>

        <div className="stats-container">
          <div className="mental-health-score">
            <div className="score-value">{userData?.mentalHealthScore || 70}</div>
            <div className="score-label">Mental Health Score</div>
          </div>
          <div className="chart-container card">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        <h2 className="dashboard-title" style={{ marginTop: '30px' }}>Your Support Tools</h2>
        <div className="dashboard-grid">
          <Link to="/chat" className="dashboard-card">
            <h3 className="dashboard-card-title">Talk to MindCare AI</h3>
            <p>Chat with our AI assistant for emotional support and guidance.</p>
          </Link>

          <Link to="/therapist" className="dashboard-card">
            <h3 className="dashboard-card-title">Contact a Therapist</h3>
            <p>Schedule an appointment with a professional therapist.</p>
          </Link>

          <Link to="/meditation" className="dashboard-card">
            <h3 className="dashboard-card-title">Meditation Guide</h3>
            <p>Access guided meditation sessions to help reduce stress and anxiety.</p>
          </Link>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>Mental Health Tips</h3>
          <ul>
            <li>Practice mindfulness for at least 10 minutes daily</li>
            <li>Maintain a regular sleep schedule</li>
            <li>Stay physically active with regular exercise</li>
            <li>Connect with friends and family regularly</li>
            <li>Take breaks from social media and news</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;