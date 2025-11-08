import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [totalusers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard-stats');
        if (response.data.success) {
          setTotalUsers(response.data.stats.totalUsers || 0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <footer className="fitness-footer">
      <div className="footer-background">
        <div className="fitness-shape shape-1"></div>
        <div className="fitness-shape shape-2"></div>
        <div className="fitness-shape shape-3"></div>
      </div>
      
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo">
              <i className="bi bi-gear-fill"></i>
            </div>
            <h3>FitZone Admin</h3>
            <p>Manage your fitness platform with comprehensive admin tools and analytics.</p>
            <div className="fitness-stats">
              <div className="stat-item">
                <i className="bi bi-people-fill"></i>
                <span>User Management</span>
              </div>
              <div className="stat-item">
                <i className="bi bi-graph-up"></i>
                <span>Analytics</span>
              </div>
            </div>
          </div>

          <div className="footer-stats">
            <h4><i className="bi bi-speedometer2"></i> System Status</h4>
            <div className="progress-cards">
              <div className="progress-card">
                <div className="progress-icon">
                  <i className="bi bi-server"></i>
                </div>
                <div className="progress-info">
                  <span className="progress-label">Server Status</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '100%'}}></div>
                  </div>
                  <span className="progress-text">Online</span>
                </div>
              </div>
              
              <div className="progress-card">
                <div className="progress-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="progress-info">
                  <span className="progress-label">Active Users</span>
                  <span className="progress-value">{totalusers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} FitZone Admin Panel. All rights reserved.</p>
            <p>Made with <i className="bi bi-heart-fill"></i> for fitness management</p>
          </div>
          <div className="footer-tech">
            <span>Powered by</span>
            <div className="tech-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Node.js</span>
              <span className="tech-badge">MongoDB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;