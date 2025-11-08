import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../config/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    totalTrainers: 0,
    activeTrainers: 0,
    totalWorkouts: 0,
    completedWorkouts: 0,
    totalNutritionEntries: 0,
    uniqueNutritionUsers: 0,
    recentUsers: 0,
    recentWorkouts: 0,
    monthlyActiveUsers: 0,
    totalCaloriesBurned: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/dashboard-stats')
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { key: 'totalUsers', label: 'Total Users', icon: 'bi-people-fill', path: '/users', color: '#1f2937' },
    { key: 'verifiedUsers', label: 'Verified Users', icon: 'bi-person-check-fill', path: '/users', color: '#059669' },
    { key: 'pendingUsers', label: 'Pending Users', icon: 'bi-person-exclamation', path: '/users', color: '#dc2626' },
    { key: 'monthlyActiveUsers', label: 'Monthly Active', icon: 'bi-graph-up-arrow', path: '/users', color: '#0891b2' },
    // { key: 'totalTrainers', label: 'Total Trainers', icon: 'bi-person-badge-fill', path: '/trainers', color: '#374151' },
    // { key: 'activeTrainers', label: 'Active Trainers', icon: 'bi-person-check', path: '/trainers', color: '#16a34a' },
    { key: 'totalWorkouts', label: 'Total Workouts', icon: 'bi-lightning-charge-fill', path: '/workout-plans', color: '#4b5563' },
    { key: 'completedWorkouts', label: 'Completed Workouts', icon: 'bi-trophy-fill', path: '/workout-plans', color: '#ea580c' },
    { key: 'totalNutritionEntries', label: 'Nutrition Entries', icon: 'bi-heart-pulse-fill', path: '/nutrition-plans', color: '#6b7280' },
    { key: 'uniqueNutritionUsers', label: 'Nutrition Users', icon: 'bi-people', path: '/nutrition-plans', color: '#7c2d12' },
    { key: 'totalCaloriesBurned', label: 'Calories Burned', icon: 'bi-fire', path: '/workout-plans', color: '#dc2626' },
    { key: 'recentUsers', label: 'New Users (7d)', icon: 'bi-person-plus-fill', path: '/users', color: '#7c3aed' },
    { key: 'recentWorkouts', label: 'New Workouts (7d)', icon: 'bi-plus-circle-fill', path: '/workout-plans', color: '#9333ea' }
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-gear-fill"></i>
          </div>
          <h1>Admin Dashboard</h1>
          <p>Manage your fitness platform efficiently</p>
        </div>
      </div>

      <div className="admin-stats">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading dashboard stats...</p>
          </div>
        ) : (
          statsCards.map((card, index) => (
            <Link key={card.key} to={card.path} className="admin-stat-card">
              <div className="stat-icon" style={{backgroundColor: card.color}}>
                <i className={card.icon}></i>
              </div>
              <div className="stat-content">
                <h3>{stats[card.key] || 0}</h3>
                <p>{card.label}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/trainers" className="action-btn">
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Trainer</span>
          </Link>
          <Link to="/workout-plans" className="action-btn">
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Workout</span>
          </Link>
          <Link to="/nutrition-plans" className="action-btn">
            <i className="bi bi-clipboard-plus-fill"></i>
            <span>Add Nutrition Plan</span>
          </Link>
          <Link to="/users" className="action-btn">
            <i className="bi bi-graph-up-arrow"></i>
            <span>View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard