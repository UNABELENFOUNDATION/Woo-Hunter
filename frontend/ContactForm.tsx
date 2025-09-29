import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  serviceType: string;
  urgency: string;
  message: string;
  preferredContact: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    serviceType: 'window_repair',
    urgency: 'medium',
    message: '',
    preferredContact: 'phone'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Submit to backend API
            const response = await fetch(`${API_BASE_URL}/leads/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'website_contact_form',
          timestamp: new Date().toISOString(),
          status: 'new'
        })
      });

      if (response.ok) {
        setSubmitMessage('✅ Thank you! We\'ll contact you within 2 hours during business hours.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          zipCode: '',
          serviceType: 'window_repair',
          urgency: 'medium',
          message: '',
          preferredContact: 'phone'
        });
      } else {
        setSubmitMessage('❌ Error submitting form. Please call us directly at (555) 123-4567.');
      }
    } catch (error) {
      setSubmitMessage('❌ Network error. Please call us directly at (555) 123-4567.');
    }

    setIsSubmitting(false);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '20px',
        fontSize: '24px'
      }}>
        🏠 Get Your FREE Window Quote
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#7f8c8d',
        marginBottom: '30px'
      }}>
        Professional window services in Phoenix metro area. Response within 2 hours.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="John Smith"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="john@email.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="(555) 123-4567"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            ZIP Code *
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
            pattern="[0-9]{5}"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="85254"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Service Needed
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="window_repair">Window Repair</option>
            <option value="window_replacement">Window Replacement</option>
            <option value="emergency_repair">Emergency Repair</option>
            <option value="energy_efficiency">Energy Efficiency Upgrade</option>
            <option value="commercial_service">Commercial Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Urgency Level
          </label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="low">Not Urgent - Planning ahead</option>
            <option value="medium">Medium - Within a week</option>
            <option value="high">High - Within 24 hours</option>
            <option value="emergency">Emergency - Today</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Preferred Contact Method
          </label>
          <select
            name="preferredContact"
            value={formData.preferredContact}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="phone">Phone Call</option>
            <option value="text">Text Message</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Tell us about your project
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            placeholder="Describe your window issues, number of windows, timeline, etc."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isSubmitting ? '#bdc3c7' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {isSubmitting ? '📤 Submitting...' : '🚀 Get FREE Quote'}
        </button>

        {submitMessage && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: submitMessage.includes('✅') ? '#d4edda' : '#f8d7da',
            color: submitMessage.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${submitMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {submitMessage}
          </div>
        )}
      </form>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f4f8',
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', fontWeight: 'bold', color: '#2c3e50' }}>
          📞 Call for IMMEDIATE help: (555) 123-4567
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#7f8c8d' }}>
          Emergency repairs available 24/7
        </p>
      </div>
    </div>
  );
}