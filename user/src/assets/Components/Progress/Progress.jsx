import React, { useState } from 'react';
import { useUser } from '../UserContext/UserContext';
import './Progress.css';

const Progress = () => {
  const { user, updateWeight } = useUser();
  const [weight, setWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    weeklyGoal: 5,
    monthlyWorkouts: 0,
    weeklyWorkouts: 0
  });
  const [goal, setGoal] = useState({ target: 0, current: 0 });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState('');

  React.useEffect(() => {
    if (user) {
      fetchUserData();
      fetchWorkoutStats();
      fetchProgressHistory();
    }
  }, [user]);

  const fetchProgressHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const history = data.progress.map(entry => ({
          date: entry.date.split('T')[0],
          weight: entry.weight
        }));
        setWeightHistory(history);
        if (history.length > 0) {
          setGoal(prev => ({ ...prev, current: history[0].weight }));
        }
      }
    } catch (error) {
      console.error('Error fetching progress history:', error);
    }
  };

  const fetchWorkoutStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const completedWorkouts = data.workouts.filter(w => w.isCompleted);
        const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        const totalMinutes = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        
        // Calculate this week's workouts
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const weeklyWorkouts = completedWorkouts.filter(w => {
          const workoutDate = new Date(w.completedAt || w.date);
          return workoutDate >= startOfWeek;
        }).length;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyWorkouts = data.workouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
        }).length;
        
        setStats(prev => ({
          ...prev,
          workoutsCompleted: completedWorkouts.length,
          caloriesBurned: totalCalories,
          activeMinutes: totalMinutes,
          monthlyWorkouts,
          weeklyWorkouts
        }));
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };

  const fetchUserData = () => {
    if (user) {
      const currentWeight = user.weight || 70;
      let targetWeight = currentWeight;
      if (user.fitnessGoal === 'weight_loss') {
        targetWeight = Math.max(50, currentWeight - 10);
      } else if (user.fitnessGoal === 'muscle_gain') {
        targetWeight = currentWeight + 5;
      }
      
      setGoal({ target: targetWeight, current: currentWeight });
      
      const activityMultipliers = {
        sedentary: 0.5,
        lightly_active: 1,
        moderately_active: 1.5,
        very_active: 2,
        extremely_active: 2.5
      };
      
      const multiplier = activityMultipliers[user.activityLevel] || 1;
      
      setStats(prev => ({
        ...prev,
        weeklyGoal: Math.round(3 * multiplier) + 2
      }));
    }
  };

  const addWeight = async () => {
    if (weight) {
      try {
        const weightValue = parseFloat(weight);
        
        const token = localStorage.getItem('token');
        const progressResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            weight: weightValue
          })
        });
        
        const progressData = await progressResponse.json();
        if (progressData.success) {
          const success = await updateWeight(weightValue);
          if (success) {
            fetchProgressHistory();
            fetchUserData();
            setWeight('');
          }
        }
      } catch (error) {
        console.error('Error adding weight entry:', error);
      }
    }
  };

  const updateWeeklyGoal = () => {
    if (newWeeklyGoal && parseInt(newWeeklyGoal) > 0) {
      setStats(prev => ({ ...prev, weeklyGoal: parseInt(newWeeklyGoal) }));
      setShowGoalForm(false);
      setNewWeeklyGoal('');
    }
  };

  const progressPercentage = Math.max(0, Math.min(100, ((weightHistory[0]?.weight - goal.current) / (weightHistory[0]?.weight - goal.target)) * 100));
  const weeklyProgress = (stats.weeklyWorkouts / stats.weeklyGoal) * 100;

  return (
    <div className="progress-container">
      <h2>Progress Analytics</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon weight">
            <i className="bi bi-speedometer2"></i>
          </div>
          <div className="stat-info">
            <h3>{user?.weight || goal.current}kg</h3>
            <p>Current Weight</p>
            <span className="trend positive">-2.3kg this month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon workouts">
            <i className="bi bi-trophy-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.workoutsCompleted}</h3>
            <p>Workouts Completed</p>
            <span className="trend positive">+{stats.monthlyWorkouts} this month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon calories">
            <i className="bi bi-fire"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.caloriesBurned.toLocaleString()}</h3>
            <p>Calories Burned</p>
            <span className="trend positive">Total burned</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon time">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{Math.round(stats.activeMinutes / 60)}h</h3>
            <p>Active Hours</p>
            <span className="trend positive">Total time</span>
          </div>
        </div>
      </div>

      <div className="progress-content">
        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-graph-up"></i> Weight Progress</h3>
          </div>
          <div className="weight-progress">
            <div className="progress-summary">
              <div className="current-stats">
                <div className="stat">
                  <span className="label">Current</span>
                  <span className="value">{user?.weight || goal.current}kg</span>
                </div>
                <div className="stat">
                  <span className="label">Goal</span>
                  <span className="value">{goal.target}kg</span>
                </div>
                <div className="stat">
                  <span className="label">Remaining</span>
                  <span className="value">{(goal.current - goal.target).toFixed(1)}kg</span>
                </div>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="progress-text">{Math.round(progressPercentage)}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-calendar-check"></i> Weekly Goal Progress</h3>
            <button className="btn-outline" onClick={() => setShowGoalForm(true)}>
              <i className="bi bi-gear"></i> Set Goal
            </button>
          </div>
          <div className="weekly-progress">
            <div className="goal-summary">
              <div className="goal-stat">
                <span className="value">{stats.weeklyWorkouts}</span>
                <span className="label">This week</span>
              </div>
              <div className="goal-stat">
                <span className="value">{stats.weeklyGoal}</span>
                <span className="label">Weekly goal</span>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, weeklyProgress)}%` }}></div>
              </div>
              <span className="progress-text">{Math.round(weeklyProgress)}% of weekly goal</span>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-plus-circle"></i> Log New Weight</h3>
          </div>
          <div className="weight-form">
            <div className="input-group">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight (kg)"
                step="0.1"
              />
              <button onClick={addWeight} className="btn-primary" disabled={!weight}>
                <i className="bi bi-plus"></i> Add Entry & Update Profile
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              This will update your weight in progress history and your profile
            </p>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-clock-history"></i> Weight History</h3>
          </div>
          <div className="history-table">
            <div className="table-header">
              <span>Date</span>
              <span>Weight</span>
              <span>Change</span>
            </div>
            {weightHistory.map((entry, index) => {
              const prevEntry = weightHistory[index + 1];
              const change = prevEntry ? entry.weight - prevEntry.weight : 0;
              
              return (
                <div key={`${entry.date}-${index}`} className="table-row">
                  <span className="date">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="weight">{entry.weight}kg</span>
                  <span className={`change ${change < 0 ? 'negative' : change > 0 ? 'positive' : 'neutral'}`}>
                    {prevEntry ? (change > 0 ? '+' : '') + change.toFixed(1) + 'kg' : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showGoalForm && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', width: '400px'}}>
            <h3 style={{margin: '0 0 20px 0'}}>Set Weekly Workout Goal</h3>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Workouts per week</label>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <button onClick={() => setNewWeeklyGoal('3')} style={{padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>3</button>
                <button onClick={() => setNewWeeklyGoal('4')} style={{padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>4</button>
                <button onClick={() => setNewWeeklyGoal('5')} style={{padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>5</button>
                <button onClick={() => setNewWeeklyGoal('6')} style={{padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>6</button>
              </div>
              <input
                type="number"
                value={newWeeklyGoal}
                onChange={(e) => setNewWeeklyGoal(e.target.value)}
                placeholder="e.g., 5"
                min="1"
                max="7"
                style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '10px'}}
              />
            </div>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button className="btn-secondary" onClick={() => {setShowGoalForm(false); setNewWeeklyGoal('');}}>Cancel</button>
              <button className="btn-primary" onClick={updateWeeklyGoal}>Set Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;