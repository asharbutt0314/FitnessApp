import React, { useState, useEffect } from 'react';
import './Workouts.css';

const Workouts = () => {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    category: 'strength',
    exercises: []
  });
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    avgDuration: 0,
    totalVolume: 0,
    monthlyWorkouts: 0
  });
  const [startedWorkouts, setStartedWorkouts] = useState(new Set());
  const [workoutTimers, setWorkoutTimers] = useState(new Map());
  const [intervals, setIntervals] = useState(new Map());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingWorkout, setCompletingWorkout] = useState(null);


  useEffect(() => {
    fetchUserData();
    fetchWorkouts();
    
    // Cleanup intervals on unmount
    return () => {
      intervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, []);

  useEffect(() => {
    if (showCreateForm || showEditForm || showCompletionModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showCreateForm, showEditForm, showCompletionModal]);

  const fetchUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWorkouts(data.workouts);
        
        // Calculate stats
        const totalWorkouts = data.workouts.length;
        const completedWorkouts = data.workouts.filter(w => w.isCompleted);
        const totalTime = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        console.log('Initial fetch - Completed workouts:', completedWorkouts.length);
        console.log('Initial fetch - Total time:', totalTime);
        const totalVolume = data.workouts.reduce((sum, w) => 
          sum + w.exercises.reduce((exSum, ex) => exSum + (ex.weight || 0) * (ex.sets || 0), 0), 0
        );
        
        // Calculate this month's workouts
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyWorkouts = data.workouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
        }).length;
        
        setStats({
          totalWorkouts,
          thisWeek: completedWorkouts.length,
          avgDuration: totalTime,
          totalVolume,
          monthlyWorkouts
        });
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleCreateWorkout = async () => {
    console.log('Creating workout:', newWorkout);
    if (newWorkout.name && newWorkout.exercises.length > 0) {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newWorkout)
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          setWorkouts([data.workout, ...workouts]);
          setNewWorkout({ name: '', category: 'strength', exercises: [] });
          setShowCreateForm(false);
        } else {
          console.error('Workout creation failed:', data.message);
        }
      } catch (error) {
        console.error('Error creating workout:', error);
      }
    } else {
      console.log('Validation failed - name or exercises missing');
    }
  };

  const addExercise = () => {
    if (newExercise.name) {
      setNewWorkout({
        ...newWorkout,
        exercises: [...newWorkout.exercises, { 
          ...newExercise,
          sets: parseInt(newExercise.sets) || 0,
          reps: parseInt(newExercise.reps) || 0,
          weight: parseFloat(newExercise.weight) || 0
        }]
      });
      setNewExercise({ name: '', sets: '', reps: '', weight: '', notes: '' });
      
      // Scroll to bottom of exercises list
      setTimeout(() => {
        const exercisesList = document.querySelector('.exercises-list-container');
        if (exercisesList) {
          exercisesList.scrollTop = exercisesList.scrollHeight;
        }
      }, 100);
    }
  };

  const removeExercise = (index) => {
    setNewWorkout({
      ...newWorkout,
      exercises: newWorkout.exercises.filter((_, i) => i !== index)
    });
  };



  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      name: workout.name,
      category: workout.category,
      exercises: [...workout.exercises]
    });
    setShowEditForm(true);
  };

  const handleUpdateWorkout = async () => {
    if (newWorkout.name && newWorkout.exercises.length > 0 && editingWorkout) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${editingWorkout._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newWorkout)
        });
        const data = await response.json();
        if (data.success) {
          setWorkouts(workouts.map(w => w._id === editingWorkout._id ? data.workout : w));
          setNewWorkout({ name: '', category: 'strength', exercises: [] });
          setEditingWorkout(null);
          setShowEditForm(false);
        }
      } catch (error) {
        console.error('Error updating workout:', error);
      }
    }
  };

  const deleteWorkout = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWorkouts(workouts.filter(w => w._id !== id));
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const startWorkout = async (id) => {
    // If workout is completed, reset it first
    const workout = workouts.find(w => (w._id || w.id) === id);
    if (workout && workout.isCompleted) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            isCompleted: false,
            completedAt: null,
            duration: 0,
            caloriesBurned: 0
          })
        });
        const data = await response.json();
        if (data.success) {
          setWorkouts(workouts.map(w => (w._id || w.id) === id ? data.workout : w));
        }
      } catch (error) {
        console.error('Error resetting workout:', error);
      }
    }
    
    setStartedWorkouts(prev => new Set([...prev, id]));
    
    // Start timer
    const startTime = Date.now();
    setWorkoutTimers(prev => new Map(prev.set(id, { startTime, elapsed: 0 })));
    
    // Set interval to update timer every second
    const intervalId = setInterval(() => {
      setWorkoutTimers(prev => {
        const timer = prev.get(id);
        if (timer) {
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          return new Map(prev.set(id, { ...timer, elapsed }));
        }
        return prev;
      });
    }, 1000);
    
    setIntervals(prev => new Map(prev.set(id, intervalId)));
  };

  const completeWorkout = (id) => {
    const timer = workoutTimers.get(id);
    const durationMinutes = timer ? Math.round(timer.elapsed / 60) : 0;
    const workout = workouts.find(w => (w._id || w.id) === id);
    
    // Calculate calories based on duration and category
    const calculateCalories = (duration, category) => {
      const caloriesPerMinute = {
        strength: 8,
        cardio: 12,
        flexibility: 4,
        sports: 10
      };
      return Math.round(duration * (caloriesPerMinute[category] || 8));
    };
    
    const calculatedCalories = calculateCalories(durationMinutes, workout?.category);
    setCompletingWorkout({ id, durationMinutes, workout, calculatedCalories });
    setShowCompletionModal(true);
  };

  const handleWorkoutCompletion = async () => {
    if (!completingWorkout) return;
    
    try {
      const token = localStorage.getItem('token');
      const { id, durationMinutes, calculatedCalories } = completingWorkout;
      
      // Clear timer and interval
      const intervalId = intervals.get(id);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervals(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          duration: durationMinutes, 
          caloriesBurned: calculatedCalories 
        })
      });
      const data = await response.json();
      if (data.success) {
        const updatedWorkouts = workouts.map(w => (w._id || w.id) === id ? data.workout : w);
        setWorkouts(updatedWorkouts);
        
        // Recalculate stats with updated workouts
        const completedWorkouts = updatedWorkouts.filter(w => w.isCompleted);
        console.log('Completed workouts:', completedWorkouts);
        console.log('Durations:', completedWorkouts.map(w => w.duration));
        const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        console.log('Total duration:', totalDuration, 'Count:', completedWorkouts.length);
        const totalTime = totalDuration;
        console.log('Total time:', totalTime);
        const totalVolume = updatedWorkouts.reduce((sum, w) => 
          sum + w.exercises.reduce((exSum, ex) => exSum + (ex.weight || 0) * (ex.sets || 0), 0), 0
        );
        
        setStats({
          totalWorkouts: updatedWorkouts.length,
          thisWeek: completedWorkouts.length,
          avgDuration: totalTime,
          totalVolume,
          monthlyWorkouts: updatedWorkouts.filter(w => {
            const workoutDate = new Date(w.date);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
          }).length
        });
        
        setStartedWorkouts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setWorkoutTimers(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
        setShowCompletionModal(false);
        setCompletingWorkout(null);
      }
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const filteredWorkouts = activeFilter === 'all' ? workouts : workouts.filter(w => w.category === activeFilter);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fee2e2;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-weight: bold;
          color: #dc2626;
        }
        .workout-actions-header {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 14px;
        }
        .workout-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          overflow: hidden;
        }
        .workout-form {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          height: 95vh;
          overflow: hidden;
          padding: 15px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        body.modal-open {
          overflow: hidden;
        }
        .form-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        .form-left {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .form-right {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .exercises-section {
          flex: 1;
          overflow: hidden;
        }
        .exercises-list {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
        }
        .form-group {
          margin-bottom: 10px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        .exercises-section {
          max-height: 300px;
          overflow-y: auto;
        }
        .exercise-form {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
        }
        .exercises-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
        }

      `}</style>
      <div className="workouts-container">
      <h2>Workout Management</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon workouts">
            <i className="bi bi-trophy-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalWorkouts}</h3>
            <p>Total Workouts</p>
            {/* <span className="trend positive">+{stats.monthlyWorkouts} this month</span> */}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon weekly">
            <i className="bi bi-calendar-week"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.thisWeek}</h3>
            <p>This Week</p>
            <span className="trend positive">On track</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon duration">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.avgDuration} min</h3>
            <p>Total Time</p>
            <span className="trend positive">All workouts</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon volume">
            <i className="bi bi-bar-chart-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalVolume.toLocaleString()}</h3>
            <p>Total Volume (kg)</p>
            {/* <span className="trend positive">+12% vs last month</span> */}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon calories">
            <i className="bi bi-fire"></i>
          </div>
          <div className="stat-info">
            <h3>{workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}</h3>
            <p>Calories Burned</p>
            <span className="trend positive">Total burned</span>
          </div>
        </div>
      </div>

      <div className="workouts-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <i className="bi bi-grid-3x3-gap"></i> All
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'strength' ? 'active' : ''}`}
            onClick={() => setActiveFilter('strength')}
          >
            <i className="bi bi-lightning-charge"></i> Strength
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'cardio' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cardio')}
          >
            <i className="bi bi-heart-pulse"></i> Cardio
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'flexibility' ? 'active' : ''}`}
            onClick={() => setActiveFilter('flexibility')}
          >
            <i className="bi bi-person-arms-up"></i> Flexibility
          </button>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="bi bi-plus-circle"></i> New Workout
        </button>
      </div>

      {(showCreateForm || showEditForm) && (
        <div className="workout-form-modal">
          <div className="workout-form">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>{showEditForm ? 'Edit Workout' : 'Create New Workout'}</h3>
              <button onClick={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
                setEditingWorkout(null);
                setNewWorkout({ name: '', category: 'strength', exercises: [] });
              }} style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="form-content">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                <div className="form-group">
                  <label>Workout Name</label>
                  <input
                    type="text"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                    placeholder="e.g., Push Day, Morning Run"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newWorkout.category}
                    onChange={(e) => setNewWorkout({...newWorkout, category: e.target.value})}
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 style={{marginBottom: '20px'}}>Add Exercise</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                    style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px'}}
                  />
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
                    <input
                      type="number"
                      placeholder="Sets"
                      value={newExercise.sets}
                      onChange={(e) => setNewExercise({...newExercise, sets: e.target.value})}
                      style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px'}}
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={newExercise.reps}
                      onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                      style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px'}}
                    />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={newExercise.weight}
                      onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                      style={{padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px'}}
                    />
                  </div>

                </div>
              </div>

              {newWorkout.exercises.length > 0 && (
                <div>
                  <h4 style={{marginBottom: '15px'}}>Added Exercises ({newWorkout.exercises.length})</h4>
                  <div className="exercises-list-container" style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px'}}>
                    {newWorkout.exercises.map((exercise, index) => (
                      <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '8px'}}>
                        <div>
                          <div style={{fontWeight: '500', color: '#374151'}}>{exercise.name}</div>
                          <div style={{fontSize: '12px', color: '#6b7280'}}>{exercise.sets} sets × {exercise.reps} reps {exercise.weight ? `@ ${exercise.weight}kg` : ''}</div>
                        </div>
                        <button onClick={() => removeExercise(index)} style={{background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px'}}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions" style={{marginTop: 'auto', padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb'}}>
              <button className="btn-secondary" onClick={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
                setEditingWorkout(null);
                setNewWorkout({ name: '', category: 'strength', exercises: [] });
              }}>Cancel</button>
              <button type="button" onClick={addExercise} className="btn-outline">Add Exercise</button>
              <button className="btn-primary" onClick={showEditForm ? handleUpdateWorkout : handleCreateWorkout}>
                {showEditForm ? 'Update Workout' : 'Create Workout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && completingWorkout && (
        <div className="workout-form-modal">
          <div className="workout-form" style={{maxWidth: '500px', height: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>🎉 Workout Completed!</h3>
              <button onClick={() => {
                setShowCompletionModal(false);
                setCompletingWorkout(null);
              }} style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="form-content">
              <div className="completion-summary" style={{textAlign: 'center', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '20px'}}>
                <p style={{margin: '0 0 10px 0', fontSize: '18px'}}><strong>{completingWorkout.workout?.name}</strong></p>
                <p style={{margin: '0 0 10px 0', color: '#6b7280'}}>Duration: <strong>{completingWorkout.durationMinutes} minutes</strong></p>
                <p style={{margin: 0, color: '#059669', fontSize: '16px'}}>Calories Burned: <strong>{completingWorkout.calculatedCalories}</strong></p>
              </div>
            </div>

            <div className="form-actions" style={{marginTop: 'auto', padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb'}}>
              <button className="btn-secondary" onClick={() => {
                setShowCompletionModal(false);
                setCompletingWorkout(null);
              }}>Cancel</button>
              <button className="btn-primary" onClick={handleWorkoutCompletion}>
                Complete Workout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="workouts-grid">
        {filteredWorkouts.map(workout => (
          <div key={workout._id || workout.id} className="workout-card">
            <div className="workout-header">
              <div className="workout-title">
                <h3>{workout.name}</h3>
                <span className={`category-badge ${workout.category}`}>
                  <i className={`bi ${workout.category === 'strength' ? 'bi-lightning-charge' : 
                    workout.category === 'cardio' ? 'bi-heart-pulse' : 
                    workout.category === 'flexibility' ? 'bi-person-arms-up' : 'bi-trophy'}`}></i>
                  {workout.category}
                </span>
              </div>
              <div className="workout-actions-header">
                {workout.isCompleted ? (
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => startWorkout(workout._id || workout.id)}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Start Again
                  </button>
                ) : !startedWorkouts.has(workout._id || workout.id) ? (
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => startWorkout(workout._id || workout.id)}
                  >
                    <i className="bi bi-play-fill"></i> Start
                  </button>
                ) : (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => completeWorkout(workout._id || workout.id)}
                  >
                    <i className="bi bi-check-circle"></i> Complete
                  </button>
                )}
                <button 
                  className="btn-outline btn-sm"
                  onClick={() => editWorkout(workout)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn-danger btn-sm"
                  onClick={() => deleteWorkout(workout._id || workout.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
            
            <div className="exercises-summary">
              <div className="summary-stats">
                <div className="stat">
                  <span className="value">{workout.exercises.length}</span>
                  <span className="label">Exercises</span>
                </div>
                <div className="stat">
                  <span className="value">{workout.duration || 0}</span>
                  <span className="label">Minutes</span>
                </div>
                <div className="stat">
                  <span className="value">{workout.exercises.reduce((sum, ex) => sum + (ex.weight || 0) * (ex.sets || 0), 0)}</span>
                  <span className="label">Volume (kg)</span>
                </div>
                <div className="stat">
                  <span className="value">{workout.caloriesBurned || 0}</span>
                  <span className="label">Calories</span>
                </div>
                </div>
              </div>
            
            <div className="exercises-preview">
              {workout.exercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-name">&nbsp;&nbsp;</span>                    
                    <span className="exercise-details">
                        {exercise.sets} × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                    </span>
                  </div>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <div className="more-exercises">
                  +{workout.exercises.length - 3} more exercises
                </div>
              )}
            </div>

            {startedWorkouts.has(workout._id || workout.id) && !workout.isCompleted && (
              <div className="timer-display">
                <i className="bi bi-stopwatch" style={{
                  animation: 'pulse 1s infinite',
                  color: '#ef4444'
                }}></i>
                <span>{(() => {
                  const timer = workoutTimers.get(workout._id || workout.id);
                  if (!timer) return '00:00';
                  const minutes = Math.floor(timer.elapsed / 60);
                  const seconds = timer.elapsed % 60;
                  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                })()}</span>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Workouts;