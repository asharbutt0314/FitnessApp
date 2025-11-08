import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/navbar.css'

function Navbar() {
  const location = useLocation()

  useEffect(() => {
    const handlePopState = () => {
      if (!localStorage.getItem('admin')) {
        window.location.replace('/login')
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navItems = [
    { path: '/', icon: 'bi-gear-fill', label: 'Dashboard' },
    { path: '/users', icon: 'bi-people-fill', label: 'Users' },
    { path: '/trainers', icon: 'bi-person-badge-fill', label: 'Trainers' },
    { path: '/workout-plans', icon: 'bi-lightning-charge-fill', label: 'Workouts' },
    { path: '/nutrition-plans', icon: 'bi-heart-pulse-fill', label: 'Nutrition' },
    { path: '/profile', icon: 'bi-person-gear', label: 'Profile' }
  ]

  const handleLogout = () => {
    localStorage.clear()
    window.history.pushState(null, null, '/login')
    window.location.replace('/login')
  }

  return (
    <nav className="admin-nav">
      <div className="admin-nav-wrapper">
        <Link className="admin-brand" to="/">
          <div className="admin-brand-logo">
            <i className="bi bi-gear-fill"></i>
          </div>
          <span className="admin-brand-name">FitZone Admin</span>
        </Link>

        <div className="admin-nav-items">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              to={item.path}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
          <button 
            className="admin-nav-item logout-btn"
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <i className="bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar