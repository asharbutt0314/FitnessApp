import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext/UserContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    caloriesBurned: 0,
    workoutsCompleted: 0,
    currentWeight: 0,
    stepsToday: 0,
    monthlyWorkouts: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);



  const fetchDashboardStats = async () => {
    if (user) {
      // Fetch calories burned from workouts and monthly count
      let totalCaloriesBurned = 0;
      let monthlyWorkouts = 0;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          totalCaloriesBurned = data.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          
          // Calculate this month's workouts
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          monthlyWorkouts = data.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
          }).length;
        }
      } catch (error) {
        console.error('Error fetching workouts for calories:', error);
      }
      
      setStats({
        caloriesBurned: totalCaloriesBurned,
        workoutsCompleted: user.age || 'N/A',
        currentWeight: user.weight || 'N/A',
        stepsToday: user.height || 'N/A',
        monthlyWorkouts
      });
    }
  };

  return (
    <div className="fitness-dashboard">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <div className="welcome-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>
          <div className="welcome-text">
            <h1>Welcome Back{user ? `, ${user.username}` : ''}!</h1>
            <p>Ready to achieve your fitness goals today?</p>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon calories">
            <i className="bi bi-calculator"></i>
          </div>
          <div className="stat-info">
            <h3>{(() => {
              if (user && user.height && user.weight) {
                const heightInM = user.height / 100;
                return (user.weight / (heightInM * heightInM)).toFixed(1);
              }
              return 'N/A';
            })()}</h3>
            <p>BMI Index</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon workouts">
            <i className="bi bi-calendar-event"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.workoutsCompleted || 'N/A'}</h3>
            <p>Age (Years)</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon weight">
            <i className="bi bi-speedometer2"></i>
          </div>
          <div className="stat-info">
            <h3>{user?.weight || 'N/A'}</h3>
            <p>Weight (kg)</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon steps">
            <i className="bi bi-rulers"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.stepsToday || 'N/A'}</h3>
            <p>Height (cm)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon calories">
            <i className="bi bi-fire"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.caloriesBurned}</h3>
            <p>Calories Burned</p>
            <span className="trend positive">+{stats.monthlyWorkouts} this month</span>
          </div>
        </div>
      </div>
      

      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-person-fill"></i> Your Profile</h3>
          </div>
          <div className="profile-summary" style={{ padding: '20px', lineHeight: '1.8' }}>
            {user && (
              <>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Age:</span>
                  <span style={{ color: '#1f2937' }}>{user.age ? `${user.age} years` : 'Not set'}</span>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Height:</span>
                  <span style={{ color: '#1f2937' }}>{user.height ? `${user.height} cm` : 'Not set'}</span>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Weight:</span>
                  <span style={{ color: '#1f2937' }}>{user?.weight ? `${user.weight} kg` : 'Not set'}</span>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Gender:</span>
                  <span style={{ color: '#1f2937' }}>{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-target"></i> Fitness Goals</h3>
          </div>
          <div className="goals-summary" style={{ padding: '20px' }}>
            {user && (
              <>
                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Primary Goal</h4>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{user.fitnessGoal ? user.fitnessGoal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set'}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Activity Level</h4>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{user.activityLevel ? user.activityLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-calendar-check"></i> Quick Actions</h3>
          </div>
          <div className="actions-summary" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div 
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
            >
              <i className="bi bi-pencil-square" style={{ marginRight: '10px', color: '#4f46e5', fontSize: '18px' }}></i>
              <span style={{ color: '#374151', fontWeight: '500' }}>Update Profile</span>
            </div>
            <div 
              onClick={() => navigate('/workouts')}
              style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
            >
              <i className="bi bi-plus-circle" style={{ marginRight: '10px', color: '#10b981', fontSize: '18px' }}></i>
              <span style={{ color: '#374151', fontWeight: '500' }}>Log Workout</span>
            </div>
            <div 
              onClick={() => navigate('/progress')}
              style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
            >
              <i className="bi bi-graph-up" style={{ marginRight: '10px', color: '#f59e0b', fontSize: '18px' }}></i>
              <span style={{ color: '#374151', fontWeight: '500' }}>Track Progress</span>
            </div>
            <div 
              onClick={() => navigate('/nutrition')}
              style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
            >
              <i className="bi bi-apple" style={{ marginRight: '10px', color: '#ef4444', fontSize: '18px' }}></i>
              <span style={{ color: '#374151', fontWeight: '500' }}>Plan Nutrition</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;