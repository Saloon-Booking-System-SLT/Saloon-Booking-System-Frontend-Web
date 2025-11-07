import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to business owner portal
    // In development: localhost:3001
    // In production: your business portal URL
    const businessPortalURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-business-portal.vercel.app' // Replace with your actual business portal URL
      : 'http://localhost:3001';
    
    // Redirect to business portal
    window.location.href = businessPortalURL;
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏢</div>
      <h2>Redirecting to Business Portal...</h2>
      <p>Please wait while we redirect you to the business owner dashboard.</p>
      
      <div style={{ 
        margin: '20px 0',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <p><strong>If you're not redirected automatically:</strong></p>
        <a 
          href="http://localhost:3001"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
          onClick={() => window.location.href = 'http://localhost:3001'}
        >
          Click here to access Business Portal
        </a>
      </div>

      <button 
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default BusinessRedirect;