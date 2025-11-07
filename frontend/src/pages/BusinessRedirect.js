import React from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessRedirect = () => {
  const navigate = useNavigate();

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
      <h2>🏢 Business Portal</h2>
      <p>The business portal is currently being set up.</p>
      <p>Please contact support or try again later.</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
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