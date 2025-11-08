import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Users from './components/Users'
import Trainers from './components/Trainers'
import WorkoutPlans from './components/WorkoutPlans'
import NutritionPlans from './components/NutritionPlans'
import Profile from './components/Profile'
import AdminLogin from './assets/Components/AdminLogin/AdminLogin'
import AdminForgotPassword from './assets/Components/AdminForgotPassword/AdminForgotPassword'
import AdminResetOTPVerify from './assets/Components/AdminResetOTPVerify/AdminResetOTPVerify'
import AdminNewPassword from './assets/Components/AdminNewPassword/AdminNewPassword'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin'))

  useEffect(() => {
    const handlePopState = () => {
      if (!localStorage.getItem('admin')) {
        window.location.replace('/login')
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin-reset-otp-verify" element={<AdminResetOTPVerify />} />
        <Route path="/admin-new-password" element={<AdminNewPassword />} />
        <Route path="/*" element={<AdminLogin onLogin={() => setIsLoggedIn(true)} />} />
      </Routes>
    )
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="container-fluid">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/workout-plans" element={<WorkoutPlans />} />
          <Route path="/nutrition-plans" element={<NutritionPlans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-forgot-password" element={<Navigate to="/" />} />
          <Route path="/admin-reset-otp-verify" element={<Navigate to="/" />} />
          <Route path="/admin-new-password" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App