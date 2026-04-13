import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isDoctor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationsAPI.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = () => {
    if (!user) return [];
    if (isAdmin()) return [
      { to: '/admin', label: 'Dashboard', icon: '⬡' },
      { to: '/doctors', label: 'Doctors', icon: '🩺' },
    ];
    if (isDoctor()) return [
      { to: '/doctor/appointments', label: 'Appointments', icon: '📋' },
      { to: '/doctor/queue', label: 'Queue', icon: '⬡' },
    ];
    return [
      { to: '/doctors', label: 'Find Doctors', icon: '🔍' },
      { to: '/appointments', label: 'My Appointments', icon: '📅' },
      { to: '/queue', label: 'Live Queue', icon: '⬡' },
    ];
  };

  return (
    <nav className="navbar">
      <div className="nav-grid-line" />
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">⊕</span>
          <span className="brand-text">Smart<span>Hospital</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks().map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notif-btn">
                <span className="notif-icon">🔔</span>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </Link>
              <div className="nav-user">
                <div className="user-avatar">
                  {user.fullName?.charAt(0) || user.username?.charAt(0)}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName || user.username}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <button className="btn btn-secondary nav-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
