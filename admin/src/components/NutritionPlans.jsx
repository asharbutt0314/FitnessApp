import { useState, useEffect } from 'react'
import api from '../config/api'

function NutritionPlans() {
  const [nutritionPlans, setNutritionPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNutrition()
  }, [])

  const fetchNutrition = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/nutrition')
      if (response.data.success) {
        setNutritionPlans(response.data.nutrition)
      }
    } catch (error) {
      console.error('Error fetching nutrition:', error)
      alert('Failed to fetch nutrition data')
    } finally {
      setLoading(false)
    }
  }
  const [searchTerm, setSearchTerm] = useState('')



  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this nutrition entry?')) {
      try {
        const response = await api.delete(`/api/admin/nutrition/${planId}`)
        if (response.data.success) {
          setNutritionPlans(nutritionPlans.filter(plan => plan._id !== planId))
          alert('Nutrition entry deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting nutrition:', error)
        alert('Failed to delete nutrition entry')
      }
    }
  }

  const filteredPlans = nutritionPlans.filter(plan => 
    (plan.foodItem && plan.foodItem.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (plan.mealType && plan.mealType.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTypeColor = (type) => {
    switch(type) {
      case 'Weight Loss': return 'bg-danger'
      case 'Muscle Gain': return 'bg-success'
      case 'Maintenance': return 'bg-info'
      default: return 'bg-primary'
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>
          <h1>Nutrition Entries</h1>
          <p>Monitor user nutrition intake and meal tracking</p>
        </div>
      </div>

      <div className="admin-actions mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>All Nutrition Entries ({loading ? '...' : nutritionPlans.length})</h3>
          <div className="d-flex gap-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search nutrition plans..."
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
                <th>Food Item</th>
                <th>Meal Type</th>
                <th>Nutrition Info</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No nutrition entries found
                  </td>
                </tr>
              ) : filteredPlans.map((plan) => (
                <tr key={plan._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        <i className="bi bi-heart-pulse"></i>
                      </div>
                      <div>
                        <span className="fw-semibold">{plan.foodItem}</span>
                        {plan.userId?.username && (
                          <div className="text-muted small">User: {plan.userId.username}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge bg-info`}>
                      {plan.mealType}
                    </span>
                  </td>
                  <td>
                    <div className="text-muted">{plan.calories} cal</div>
                    <div className="text-muted small">P: {plan.protein}g | C: {plan.carbs}g | F: {plan.fat}g</div>
                  </td>
                  <td className="text-muted">{plan.quantity}</td>
                  <td className="text-muted">{new Date(plan.date).toLocaleDateString()}</td>
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

export default NutritionPlans