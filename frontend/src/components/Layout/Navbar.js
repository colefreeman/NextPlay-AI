// src/components/Layout/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/nextplay-logo-white.svg"; // Adjust the path if needed

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="App Logo" className="logo" />
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/profile">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;