import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './assets/Components/Navbar/Navbar';
import Footer from './assets/Components/Footer/Footer';
import Login from './assets/Components/Login/Login';
import Signup from './assets/Components/SignUp/Signup';
import OtpVerify from './assets/Components/SignUp/OtpVerify';
import ResetPassword from './assets/Components/ResetPassword/ResetPassword';
import ForgotPassword from './assets/Components/ForgotPassword/ForgotPassword';
import ResetOTPVerify from './assets/Components/ResetOTPVerify/ResetOTPVerify';
import NewPassword from './assets/Components/NewPassword/NewPassword';
import { ToastProvider } from './assets/Components/Toast/ToastProvider';
import { UserProvider } from './assets/Components/UserContext/UserContext';
import './App.css';
import Dashboard from './assets/Components/Dashboard/Dashboard';
import Workouts from './assets/Components/Workouts/Workouts';
import Nutrition from './assets/Components/Nutrition/Nutrition';
import Progress from './assets/Components/Progress/Progress';
import Profile from './assets/Components/Profile/Profile';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('user');



  return (
    <ToastProvider>
      <UserProvider>
        <Router>
        <div className="fitness-app">
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />} />
            <Route path="/otp-verify" element={isLoggedIn ? <Navigate to="/dashboard" /> : <OtpVerify />} />
            <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ResetPassword />} />
            <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
            <Route path="/reset-otp-verify" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ResetOTPVerify />} />
            <Route path="/new-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <NewPassword />} />
            <Route path="/*" element={
              isLoggedIn ? (
                <>
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/workouts" element={<Workouts />} />
                      <Route path="/nutrition" element={<Nutrition />} />
                      <Route path="/progress" element={<Progress />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
        </div>
        </Router>
      </UserProvider>
    </ToastProvider>
  );
};

export default App;