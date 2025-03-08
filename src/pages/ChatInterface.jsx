import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with error handling
let genAI;
let isDemoMode = false;
try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('Gemini API key is missing or using placeholder value. Using demo mode instead.');
    isDemoMode = true;
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  console.error('Error initializing Gemini API:', error);
  isDemoMode = true;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch user data and conversation history
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        if (auth.currentUser) {
          // Real authentication flow
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            
            // Load previous conversation history if available
            if (data.conversationHistory && data.conversationHistory.length > 0) {
              setMessages(data.conversationHistory);
            } else {
              // Add initial greeting message if no history
              const initialMessage = {
                text: "Hello! I'm MindCare AI, your mental health assistant. How are you feeling today?",
                sender: 'bot',
                timestamp: new Date().toISOString()
              };
              setMessages([initialMessage]);
              
              // Save initial message to Firestore
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                conversationHistory: [initialMessage]
              });
            }
          }
        } else {
          // Use mock data for demo purposes
          const mockUserData = {
            name: 'Demo User',
            email: 'demo@example.com',
            mentalHealthScore: 75,
            createdAt: new Date().toISOString(),
            conversationHistory: []
          };
          setUserData(mockUserData);
          
          // Add initial greeting message
          const initialMessage = {
            text: "Hello! I'm MindCare AI, your mental health assistant. How are you feeling today?",
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          setMessages([initialMessage]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update mental health score based on conversation
  const updateMentalHealthScore = async (userMessage, botResponse) => {
    try {
      // This is a simple algorithm to adjust the score based on message sentiment
      // In a real app, you would use more sophisticated sentiment analysis
      const lowerCaseMsg = userMessage.toLowerCase();
      
      // Keywords that might indicate negative emotions
      const negativeKeywords = ['sad', 'depressed', 'anxious', 'worried', 'stress', 'lonely', 'tired', 'exhausted', 'hopeless'];
      
      // Keywords that might indicate positive emotions
      const positiveKeywords = ['happy', 'joy', 'grateful', 'thankful', 'excited', 'peaceful', 'calm', 'relaxed', 'hopeful'];
      
      let scoreAdjustment = 0;
      
      // Check for negative keywords
      negativeKeywords.forEach(keyword => {
        if (lowerCaseMsg.includes(keyword)) {
          scoreAdjustment -= 1; // Decrease score for negative emotions
        }
      });
      
      // Check for positive keywords
      positiveKeywords.forEach(keyword => {
        if (lowerCaseMsg.includes(keyword)) {
          scoreAdjustment += 1; // Increase score for positive emotions
        }
      });
      
      // Get current score
      const currentScore = userData.mentalHealthScore || 70;
      
      // Calculate new score (keeping within 0-100 range)
      const newScore = Math.min(Math.max(currentScore + scoreAdjustment, 0), 100);
      
      // Only update if score has changed
      if (newScore !== currentScore) {
        // Only update Firestore if user is authenticated
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            mentalHealthScore: newScore
          });
        }
        
        // Update local state
        setUserData(prev => ({
          ...prev,
          mentalHealthScore: newScore
        }));
      }
    } catch (error) {
      console.error('Error updating mental health score:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Generate context for the AI based on user profile and conversation history
      const recentMessages = messages.slice(-5).map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
      
      const userContext = `
        User Profile:
        - Name: ${userData?.name || 'User'}
        - Age: ${userData?.age || 'Unknown'}
        - Gender: ${userData?.gender || 'Unknown'}
        - Medical Condition: ${userData?.medicalCondition || 'None'}
        - Current Mental Health Score: ${userData?.mentalHealthScore || 70}/100
        
        Recent Conversation:
        ${recentMessages}
        
        User: ${input}
      `;

      // Create a prompt for the AI that instructs it to act as a mental health assistant
      const prompt = `
        You are MindCare AI, a compassionate mental health support assistant. Your goal is to provide emotional support, 
        active listening, and helpful guidance to users. You should respond with empathy and understanding, 
        while encouraging positive coping strategies and self-care practices.
        
        If the user appears to be in crisis or mentions self-harm, gently suggest professional help and remind them 
        that they can use the "Contact a Therapist" feature in the app.
        
        Here is information about the current user and conversation:
        ${userContext}
        
        Respond as MindCare AI:
      `;

      let botText;
      
      if (isDemoMode) {
        // Demo mode - generate a mock response based on user input
        const lowerCaseInput = input.toLowerCase();
        
        // Simple keyword-based response system for demo purposes
        if (lowerCaseInput.includes('sad') || lowerCaseInput.includes('depressed') || lowerCaseInput.includes('unhappy')) {
          botText = "I'm sorry to hear you're feeling down. Remember that it's okay to have these feelings, and they're a normal part of life. Would you like to talk more about what's causing these feelings? Sometimes just expressing them can help lighten the burden."; 
        } else if (lowerCaseInput.includes('anxious') || lowerCaseInput.includes('worried') || lowerCaseInput.includes('stress')) {
          botText = "It sounds like you're experiencing some anxiety. Deep breathing can help in the moment - try breathing in for 4 counts, holding for 2, and exhaling for 6. Would you like to explore some other coping strategies for anxiety?"; 
        } else if (lowerCaseInput.includes('happy') || lowerCaseInput.includes('good') || lowerCaseInput.includes('great')) {
          botText = "I'm glad to hear you're feeling positive! What's contributing to these good feelings? Recognizing what brings us joy can help us intentionally include more of those things in our lives."; 
        } else if (lowerCaseInput.includes('tired') || lowerCaseInput.includes('exhausted') || lowerCaseInput.includes('sleep')) {
          botText = "Feeling tired can really affect our mental wellbeing. Are you getting enough quality sleep? Sometimes establishing a regular sleep routine and limiting screen time before bed can help improve sleep quality."; 
        } else if (lowerCaseInput.includes('help') || lowerCaseInput.includes('therapist') || lowerCaseInput.includes('professional')) {
          botText = "It's great that you're considering professional support. Our app has a 'Contact a Therapist' feature where you can schedule an appointment with a licensed professional. Would you like to know more about that?"; 
        } else {
          botText = "Thank you for sharing that with me. How long have you been feeling this way? Remember that I'm here to listen and support you, but I'm not a replacement for professional mental health care if you need it."; 
        }
        
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Real API mode
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          botText = response.text();
          
          if (!botText) {
            throw new Error('Empty response from AI');
          }
        } catch (error) {
          console.error('Error generating response from Gemini API:', error);
          throw error; // Re-throw to be caught by the outer catch block
        }
      }

      const botMessage = {
        text: botText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history in Firestore (only if authenticated)
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          conversationHistory: arrayUnion(userMessage, botMessage)
        });
      }
      
      // Update mental health score based on conversation
      await updateMentalHealthScore(input, botText);
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message if AI fails
      setMessages(prev => [...prev, {
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="chat-container">
        <div className="chat-header">
          <h2>MindCare AI Assistant</h2>
          <p>Talk about how you're feeling</p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              {message.text}
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;