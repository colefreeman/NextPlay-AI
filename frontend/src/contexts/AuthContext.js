import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log("ProtectedRoute - Current location:", location.pathname);
  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Loading:", loading);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Add this

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log("Checking auth status on path:", location.pathname); // Debug log
      const response = await fetch('http://localhost:4000/api/auth/status', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Auth status success, user data:", userData); // Debug log
        setUser(userData);
        console.log("Current path:", location.pathname); // Debug log
        // Remove automatic redirects completely
      } else {
        console.log("Auth status failed - not authenticated"); // Debug log
        setUser(null);
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:4000/auth/logout', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setUser(null);
        navigate('/login');
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user,
    ProtectedRoute,
    PublicRoute
  };

  console.log("AuthProvider - Current user:", user); // Debug log
  console.log("AuthProvider - Current path:", location.pathname); // Debug log

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { ProtectedRoute, PublicRoute };