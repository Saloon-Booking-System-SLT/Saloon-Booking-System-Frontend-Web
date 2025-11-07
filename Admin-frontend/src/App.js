import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </Router>
  );
}

export default App;