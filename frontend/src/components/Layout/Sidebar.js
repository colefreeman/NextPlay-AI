// src/components/Layout/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <Link to="/">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        {/* Add more menu items as needed */}
      </div>
    </div>
  );
};

export default Sidebar;