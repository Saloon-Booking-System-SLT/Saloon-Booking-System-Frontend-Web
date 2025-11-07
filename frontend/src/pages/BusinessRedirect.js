import React, { useEffect } from 'react';

const BusinessRedirect = () => {
  useEffect(() => {
    // Redirect to business frontend in the same window
    // You'll need to replace this URL with your deployed frontend-owner URL
    window.location.href = 'https://your-business-frontend.vercel.app';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Redirecting to Business Portal...</h2>
      <p>If you're not redirected automatically, <a href="https://your-business-frontend.vercel.app">click here</a></p>
    </div>
  );
};

export default BusinessRedirect;