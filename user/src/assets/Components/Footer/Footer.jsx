import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [totalCalories, setTotalCalories] = useState(0);
  const [userWeight, setUserWeight] = useState('N/A');

  useEffect(() => {
    // Get user weight
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserWeight(user.weight || 'N/A');
    }

    // Fetch calories from workouts
    const fetchCalories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          const calories = data.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          setTotalCalories(calories);
        }
      } catch (error) {
        console.error('Error fetching calories:', error);
      }
    };

    fetchCalories();
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
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>FitZone</h3>
            <p>Transform your fitness journey with personalized workouts and nutrition tracking.</p>
            <div className="fitness-stats">
              <div className="stat-item">
                <i className="bi bi-trophy-fill"></i>
                <span>Goal Tracking</span>
              </div>
              <div className="stat-item">
                <i className="bi bi-heart-pulse-fill"></i>
                <span>Health Monitor</span>
              </div>
            </div>
          </div>



          <div className="footer-stats">
            <h4><i className="bi bi-graph-up"></i> Your Progress</h4>
            <div className="progress-cards">
              <div className="progress-card">
                <div className="progress-icon">
                  <i className="bi bi-fire"></i>
                </div>
                <div className="progress-info">
                  <span className="progress-label">Calories Burned</span>
                  <span className="progress-value">{totalCalories}</span>
                  <span className="progress-text">&nbsp;Total burned</span>
                </div>
              </div>
              
              <div className="progress-card">
                <div className="progress-icon">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <div className="progress-info">
                  <span className="progress-label">Current Weight</span>
                  <span className="progress-value">{userWeight}&nbsp;kg</span>
                  <span className="progress-text">&nbsp;Updated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} FitZone. All rights reserved.</p>
            <p>Made with <i className="bi bi-heart-fill"></i> for fitness enthusiasts</p>
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