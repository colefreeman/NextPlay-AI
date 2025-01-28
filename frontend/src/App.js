// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import { AuthProvider, ProtectedRoute, PublicRoute } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ErrorBoundary from './components/Shared/ErrorBoundary';

// Existing Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';

// New Social Feature Pages
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';

const ProtectedLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1">
      <Navbar />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  </div>
);

const App = () => {
  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProfilePage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />

              {/* New social feature routes */}
              <Route path="/feed" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Feed />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/explore" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Explore />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/create-post" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <CreatePost />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </ApolloProvider>
  );
};

export default App;