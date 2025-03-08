import React, { useState } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const TherapistContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    reason: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Add appointment request to Firestore
      await addDoc(collection(db, 'appointments'), {
        userId: auth.currentUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        reason: formData.reason,
        additionalNotes: formData.additionalNotes,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        preferredDate: '',
        preferredTime: '',
        reason: '',
        additionalNotes: ''
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="therapist-container">
      <h1>Schedule an Appointment with a Therapist</h1>
      <p className="subtitle">Our professional therapists are here to help you. Fill out the form below to request an appointment.</p>
      
      {success && (
        <div className="success-message">
          <h3>Appointment Request Submitted!</h3>
          <p>Thank you for reaching out. A therapist will contact you within 24 hours to confirm your appointment.</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="appointment-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredDate">Preferred Date</label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredTime">Preferred Time</label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
            >
              <option value="">Select a time</option>
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
              <option value="5:00 PM">5:00 PM</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">Reason for Appointment</label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            >
              <option value="">Select a reason</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Depression">Depression</option>
              <option value="Stress">Stress Management</option>
              <option value="Relationship Issues">Relationship Issues</option>
              <option value="Grief">Grief and Loss</option>
              <option value="Trauma">Trauma</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="4"
              placeholder="Please share any additional information that might be helpful for the therapist."
            ></textarea>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Schedule Appointment'}
          </button>
        </form>
      </div>
      
      <div className="therapist-info" style={{ marginTop: '30px' }}>
        <h3>What to Expect</h3>
        <ul>
          <li>After submitting your request, a therapist will contact you to confirm the appointment.</li>
          <li>Initial sessions typically last 50-60 minutes.</li>
          <li>All information shared during sessions is confidential.</li>
          <li>You can reschedule or cancel your appointment with 24 hours notice.</li>
        </ul>
      </div>
    </div>
  );
};

export default TherapistContact;