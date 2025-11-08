import React, { useState, useEffect } from 'react';
import './Nutrition.css';

const Nutrition = () => {
  const [user, setUser] = useState(null);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState({
    calories: 2200,
    protein: 150,
    carbs: 275,
    fat: 73,
    water: 8
  });
  const [waterIntake, setWaterIntake] = useState(6);
  const [newEntry, setNewEntry] = useState({
    mealType: 'breakfast',
    foodItem: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchNutritionData();
    fetchHydrationData();
  }, [selectedDate]);

  const fetchUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Calculate personalized nutrition goals based on user data
      const calculateCalories = () => {
        if (!parsedUser.weight || !parsedUser.height || !parsedUser.age) return 2200;
        
        // Basic BMR calculation (Mifflin-St Jeor Equation)
        let bmr;
        if (parsedUser.gender === 'male') {
          bmr = 88.362 + (13.397 * parsedUser.weight) + (4.799 * parsedUser.height) - (5.677 * parsedUser.age);
        } else {
          bmr = 447.593 + (9.247 * parsedUser.weight) + (3.098 * parsedUser.height) - (4.330 * parsedUser.age);
        }
        
        // Activity level multiplier
        const activityMultipliers = {
          sedentary: 1.2,
          lightly_active: 1.375,
          moderately_active: 1.55,
          very_active: 1.725,
          extremely_active: 1.9
        };
        
        const multiplier = activityMultipliers[parsedUser.activityLevel] || 1.2;
        let calories = Math.round(bmr * multiplier);
        
        // Adjust based on fitness goal
        if (parsedUser.fitnessGoal === 'weight_loss') {
          calories -= 500; // 500 calorie deficit
        } else if (parsedUser.fitnessGoal === 'muscle_gain') {
          calories += 300; // 300 calorie surplus
        }
        
        return Math.max(1200, calories); // Minimum 1200 calories
      };
      
      const dailyCalories = calculateCalories();
      const protein = Math.round(parsedUser.weight * 2.2); // 2.2g per kg body weight
      const fat = Math.round(dailyCalories * 0.25 / 9); // 25% of calories from fat
      const carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs
      
      setGoals({
        calories: dailyCalories,
        protein,
        carbs,
        fat,
        water: 8
      });
    }
  };

  const fetchNutritionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nutrition/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNutritionLogs(data.nutrition.map(entry => ({
          ...entry,
          id: entry._id
        })));
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      setNutritionLogs([]);
    }
  };

  const fetchHydrationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nutrition/hydration/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWaterIntake(data.hydration.glasses || 0);
      }
    } catch (error) {
      console.error('Error fetching hydration data:', error);
    }
  };

  const handleAddEntry = async () => {
    if (newEntry.foodItem && newEntry.calories) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nutrition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: selectedDate,
            ...newEntry,
            calories: parseInt(newEntry.calories),
            protein: parseInt(newEntry.protein) || 0,
            carbs: parseInt(newEntry.carbs) || 0,
            fat: parseInt(newEntry.fat) || 0
          })
        });
        const data = await response.json();
        if (data.success) {
          fetchNutritionData(); // Refresh data
          setNewEntry({
            mealType: 'breakfast',
            foodItem: '',
            quantity: '',
            calories: '',
            protein: '',
            carbs: '',
            fat: ''
          });
          setShowAddForm(false);
        }
      } catch (error) {
        console.error('Error adding nutrition entry:', error);
      }
    }
  };

  const deleteEntry = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nutrition/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchNutritionData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting nutrition entry:', error);
    }
  };

  const updateWaterIntake = async (glasses) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nutrition/hydration/${selectedDate}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ glasses })
      });
      const data = await response.json();
      if (data.success) {
        setWaterIntake(glasses);
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  const getTotalNutrition = () => {
    return nutritionLogs.reduce((total, entry) => ({
      calories: total.calories + entry.calories,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const groupedMeals = nutritionLogs.reduce((groups, entry) => {
    if (!groups[entry.mealType]) {
      groups[entry.mealType] = [];
    }
    groups[entry.mealType].push(entry);
    return groups;
  }, {});

  const totals = getTotalNutrition();

  return (
    <div className="nutrition-container">
      <h2>Nutrition Dashboard</h2>
      
      <div className="nutrition-controls">
        <div className="date-selector">
          <i className="bi bi-calendar3"></i>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="bi bi-plus-circle"></i> Add Food
        </button>
      </div>

      <div className="nutrition-overview">
        <div className="macro-card calories">
          <div className="macro-icon">
            <i className="bi bi-fire"></i>
          </div>
          <div className="macro-info">
            <h3>{totals.calories}</h3>
            <p>Calories</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (totals.calories / goals.calories) * 100)}%` }}></div>
            </div>
            <span className="goal-text">{totals.calories} / {goals.calories} kcal</span>
          </div>
        </div>
        
        <div className="macro-card protein">
          <div className="macro-icon">
            <i className="bi bi-egg-fried"></i>
          </div>
          <div className="macro-info">
            <h3>{totals.protein}g</h3>
            <p>Protein</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (totals.protein / goals.protein) * 100)}%` }}></div>
            </div>
            <span className="goal-text">{totals.protein} / {goals.protein}g</span>
          </div>
        </div>
        
        <div className="macro-card carbs">
          <div className="macro-icon">
            <i className="bi bi-grain"></i>
          </div>
          <div className="macro-info">
            <h3>{totals.carbs}g</h3>
            <p>Carbohydrates</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (totals.carbs / goals.carbs) * 100)}%` }}></div>
            </div>
            <span className="goal-text">{totals.carbs} / {goals.carbs}g</span>
          </div>
        </div>
        
        <div className="macro-card fats">
          <div className="macro-icon">
            <i className="bi bi-droplet-fill"></i>
          </div>
          <div className="macro-info">
            <h3>{totals.fat}g</h3>
            <p>Fats</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (totals.fat / goals.fat) * 100)}%` }}></div>
            </div>
            <span className="goal-text">{totals.fat} / {goals.fat}g</span>
          </div>
        </div>
      </div>

      <div className="nutrition-content">
        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-cup-straw"></i> Hydration Tracking</h3>
          </div>
          <div className="hydration-tracker">
            <div className="water-progress">
              <div className="water-count">
                <span className="current">{waterIntake}</span>
                <span className="target">/ {goals.water} glasses</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (waterIntake / goals.water) * 100)}%` }}></div>
              </div>
            </div>
            <div className="water-controls">
              <button 
                className="btn-outline"
                onClick={() => updateWaterIntake(Math.max(0, waterIntake - 1))}
              >
                <i className="bi bi-dash"></i>
              </button>
              <button 
                className="btn-primary"
                onClick={() => updateWaterIntake(waterIntake + 1)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="content-card meals-card">
          <div className="card-header">
            <h3><i className="bi bi-journal-text"></i> Daily Meals</h3>
          </div>
          <div className="meals-container">
            {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => {
              const mealEntries = groupedMeals[mealType] || [];
              const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);
              
              return (
                <div key={mealType} className="meal-section">
                  <div className="meal-header">
                    <div className="meal-title">
                      <i className={`bi ${mealType === 'breakfast' ? 'bi-sunrise' : 
                        mealType === 'lunch' ? 'bi-sun' : 
                        mealType === 'dinner' ? 'bi-moon' : 'bi-cup'}`}></i>
                      <h4>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
                    </div>
                    <span className="meal-calories">{mealCalories} kcal</span>
                  </div>
                  
                  <div className="meal-entries">
                    {mealEntries.length > 0 ? mealEntries.map(entry => (
                      <div key={entry.id} className="food-entry">
                        <div className="food-details">
                          <div className="food-name">{entry.foodItem}</div>
                          <div className="food-quantity">{entry.quantity}</div>
                        </div>
                        <div className="food-macros">
                          <span className="calories">{entry.calories} kcal</span>
                          <div className="macro-breakdown">
                            <span>P: {entry.protein}g</span>
                            <span>C: {entry.carbs}g</span>
                            <span>F: {entry.fat}g</span>
                          </div>
                        </div>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )) : (
                      <div className="no-entries">
                        <i className="bi bi-plus-circle"></i>
                        <span>No {mealType} logged yet</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="nutrition-form-modal">
          <div className="nutrition-form" style={{position: 'relative'}}>
            <button onClick={() => setShowAddForm(false)} style={{position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280', zIndex: 10}}>
              <i className="bi bi-x"></i>
            </button>
            <h3 style={{marginBottom: '20px'}}>Add Food Entry</h3>
            
            <div className="form-group">
              <label>Meal Type</label>
              <select
                value={newEntry.mealType}
                onChange={(e) => setNewEntry({...newEntry, mealType: e.target.value})}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            <div className="form-group">
              <label>Food Item</label>
              <input
                type="text"
                value={newEntry.foodItem}
                onChange={(e) => setNewEntry({...newEntry, foodItem: e.target.value})}
                placeholder="e.g., Grilled Chicken Breast"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="text"
                value={newEntry.quantity}
                onChange={(e) => setNewEntry({...newEntry, quantity: e.target.value})}
                placeholder="e.g., 1 serving, 100g"
              />
            </div>

            <div className="nutrition-inputs">
              <div className="form-group">
                <label>Calories</label>
                <input
                  type="number"
                  value={newEntry.calories}
                  onChange={(e) => setNewEntry({...newEntry, calories: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Protein (g)</label>
                <input
                  type="number"
                  value={newEntry.protein}
                  onChange={(e) => setNewEntry({...newEntry, protein: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Carbs (g)</label>
                <input
                  type="number"
                  value={newEntry.carbs}
                  onChange={(e) => setNewEntry({...newEntry, carbs: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Fat (g)</label>
                <input
                  type="number"
                  value={newEntry.fat}
                  onChange={(e) => setNewEntry({...newEntry, fat: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddEntry}>Add Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;