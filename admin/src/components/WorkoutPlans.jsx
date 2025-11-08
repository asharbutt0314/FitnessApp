import { useState, useEffect } from 'react'
import api from '../config/api'

function WorkoutPlans() {
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/workouts')
      if (response.data.success) {
        setWorkoutPlans(response.data.workouts)
      }
    } catch (error) {
      console.error('Error fetching workouts:', error)
      alert('Failed to fetch workouts')
    } finally {
      setLoading(false)
    }
  }
  const [searchTerm, setSearchTerm] = useState('')



  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        const response = await api.delete(`/api/admin/workouts/${planId}`)
        if (response.data.success) {
          setWorkoutPlans(workoutPlans.filter(plan => plan._id !== planId))
          alert('Workout deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting workout:', error)
        alert('Failed to delete workout')
      }
    }
  }

  const filteredPlans = workoutPlans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-success'
      case 'Intermediate': return 'bg-warning'
      case 'Advanced': return 'bg-danger'
      default: return 'bg-primary'
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-lightning-charge-fill"></i>
          </div>
          <h1>Workout Plans</h1>
          <p>Create and manage workout routines</p>
        </div>
      </div>

      <div className="admin-actions mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>All Workout Plans ({loading ? '...' : workoutPlans.length})</h3>
          <div className="d-flex gap-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search workout plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />

          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Workout Plan</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Calories Burned</th>
                <th>Status</th>
                <th>Exercises</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No workouts found
                  </td>
                </tr>
              ) : filteredPlans.map((plan) => (
                <tr key={plan._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        <i className="bi bi-lightning-charge"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{plan.name}</div>
                        <small className="text-muted">by {plan.userId?.username || 'Unknown'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info">{plan.category}</span>
                  </td>
                  <td className="text-muted">{plan.duration || 0} min</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-fire text-danger me-1"></i>
                      <span className="fw-semibold text-danger">{plan.caloriesBurned || 0}</span>
                      <small className="text-muted ms-1">cal</small>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${plan.isCompleted ? 'bg-success' : 'bg-warning'}`}>
                      {plan.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-muted">{plan.exercises?.length || 0} exercises</td>
                  <td>
                    <button 
                      className="btn btn-sm"
                      onClick={() => deletePlan(plan._id)}
                      style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}

export default WorkoutPlans