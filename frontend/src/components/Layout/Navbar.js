// src/components/Layout/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, Search } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/nextplay-logo-white.svg";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-[#1a1a1a] text-white border-b border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="NextPlay" className="logo" />
          </Link>
        </div>

        {/* Search Bar - Only show if user is logged in */}
        {user && (
          <div className="flex-1 max-w-xl px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              {/* Notifications */}
              <button className="hover:text-blue-500">
                <Bell size={24} />
              </button>
              
              {/* Messages */}
              <button className="hover:text-blue-500">
                <MessageCircle size={24} />
              </button>
              
              {/* Profile */}
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 hover:text-blue-500"
              >
                <img
                  src={user.profile?.avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-600"
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-300 hover:text-white"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;