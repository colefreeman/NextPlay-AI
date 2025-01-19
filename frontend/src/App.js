// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';

const App = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Keep your existing routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Add the new profile route */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Keep your default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;