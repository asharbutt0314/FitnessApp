import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!localStorage.getItem('user')) {
        window.location.replace('/login')
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navItems = [
    { path: '/dashboard', icon: 'bi-house-door-fill', label: 'Home' },
    { path: '/workouts', icon: 'bi-lightning-charge-fill', label: 'Workouts' },
    { path: '/nutrition', icon: 'bi-heart-pulse-fill', label: 'Nutrition' },
    { path: '/progress', icon: 'bi-graph-up-arrow', label: 'Progress' },
    { path: '/profile', icon: 'bi-person-circle', label: 'Profile'}
  ];

  return (
    <nav className="fitness-nav">
      <div className="nav-wrapper">
        <Link className="brand" to="/dashboard">
          <div className="brand-logo">
            <i className="bi bi-lightning-charge-fill"></i>
          </div>
          <span className="brand-name">FitZone</span>
        </Link>

        <div className="nav-items">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              to={item.path}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
          <button 
            className="nav-item logout-btn"
            onClick={() => {
              localStorage.clear()
              window.history.pushState(null, null, '/login')
              window.location.replace('/login')
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;