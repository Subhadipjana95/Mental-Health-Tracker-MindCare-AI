import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import TherapistContact from './pages/TherapistContact';
import MeditationGuide from './pages/MeditationGuide';

// Styles
import './App.css';

function App() {
  // Authentication is bypassed for now
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/therapist" element={<TherapistContact />} />
        <Route path="/meditation" element={<MeditationGuide />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;