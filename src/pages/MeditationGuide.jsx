import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MeditationGuide = () => {
  const [activeSession, setActiveSession] = useState(null);

  const meditationSessions = [
    {
      id: 1,
      title: 'Breathing Meditation',
      duration: '5 minutes',
      description: 'A simple breathing meditation to help calm your mind and reduce anxiety.',
      steps: [
        'Find a comfortable seated position with your back straight.',
        'Close your eyes and take a deep breath in through your nose, counting to 4.',
        'Hold your breath for a count of 2.',
        'Exhale slowly through your mouth, counting to 6.',
        'Repeat this breathing pattern for 5 minutes, focusing only on your breath.',
        'If your mind wanders, gently bring your attention back to your breathing.'
      ]
    },
    {
      id: 2,
      title: 'Body Scan Relaxation',
      duration: '10 minutes',
      description: 'A guided body scan to release tension and promote deep relaxation.',
      steps: [
        'Lie down in a comfortable position on your back.',
        'Close your eyes and take a few deep breaths to center yourself.',
        'Bring your awareness to your feet, noticing any sensations without judgment.',
        'Slowly move your attention up through your body - legs, hips, abdomen, chest, arms, shoulders, neck, and head.',
        'At each area, notice any tension and consciously release it as you exhale.',
        'After scanning your entire body, rest in awareness of your whole body for a few minutes.'
      ]
    },
    {
      id: 3,
      title: 'Mindfulness Meditation',
      duration: '15 minutes',
      description: 'A practice to develop present-moment awareness and reduce stress.',
      steps: [
        'Sit comfortably with your back straight and eyes closed or with a soft gaze.',
        'Focus your attention on your breath, noticing the sensation of air moving in and out.',
        'When thoughts arise, acknowledge them without judgment, then gently return to your breath.',
        'Expand your awareness to include bodily sensations, sounds, and thoughts as they come and go.',
        'Practice observing these experiences with curiosity and without attachment.',
        'Remember that mindfulness is not about clearing your mind, but about being aware of what is happening in the present moment.'
      ]
    },
    {
      id: 4,
      title: 'Loving-Kindness Meditation',
      duration: '10 minutes',
      description: 'A practice to cultivate compassion for yourself and others.',
      steps: [
        'Sit in a comfortable position with your eyes closed.',
        'Begin by directing positive wishes toward yourself: "May I be happy. May I be healthy. May I be safe. May I live with ease."',
        'Next, bring to mind someone you care about and direct the same wishes to them.',
        'Then, think of a neutral person (someone you neither like nor dislike) and repeat the phrases.',
        'Finally, think of someone difficult in your life and wish them well too.',
        'End by extending these wishes to all beings everywhere.'
      ]
    }
  ];

  const handleStartSession = (id) => {
    setActiveSession(id);
    // In a real app, you might start audio playback or a timer here
  };

  const handleEndSession = () => {
    setActiveSession(null);
  };

  return (
    <div className="meditation-container">
      <h1>Guided Meditation Sessions</h1>
      <p className="subtitle">Take a moment to relax and focus on your mental wellbeing with these guided meditation practices.</p>
      
      {activeSession ? (
        <div className="active-meditation card">
          <h2>{meditationSessions.find(session => session.id === activeSession).title}</h2>
          <p><strong>Duration:</strong> {meditationSessions.find(session => session.id === activeSession).duration}</p>
          
          <div className="meditation-steps">
            <h3>Follow these steps:</h3>
            <ol>
              {meditationSessions.find(session => session.id === activeSession).steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          <div className="timer">
            {/* In a real app, you would implement a countdown timer here */}
            <p>Focus on your practice. Take your time.</p>
          </div>
          
          <button onClick={handleEndSession} className="secondary">
            End Session
          </button>
        </div>
      ) : (
        <div className="meditation-list">
          {meditationSessions.map(session => (
            <div key={session.id} className="meditation-card">
              <h2>{session.title}</h2>
              <p><strong>Duration:</strong> {session.duration}</p>
              <p>{session.description}</p>
              <button onClick={() => handleStartSession(session.id)}>
                Start Session
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="meditation-tips card" style={{ marginTop: '30px' }}>
        <h3>Tips for Effective Meditation</h3>
        <ul>
          <li>Find a quiet space where you won't be disturbed</li>
          <li>Wear comfortable clothing</li>
          <li>Try to meditate at the same time each day to build a habit</li>
          <li>Start with shorter sessions and gradually increase the duration</li>
          <li>Be patient with yourself - meditation is a practice</li>
        </ul>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/dashboard" className="auth-link">Return to Dashboard</Link>
      </div>
    </div>
  );
};

export default MeditationGuide;