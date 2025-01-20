import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

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

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/status', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (window.location.pathname === '/login') {
          navigate('/dashboard');
        }
      } else {
        setUser(null);
        if (window.location.pathname === '/dashboard') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

  // Enhanced context value with route protection components
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

// Export route protection components for direct use
export { ProtectedRoute, PublicRoute };