import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from '../Toast/ToastProvider';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();







  const handleLogin = async (e) => {
    e.preventDefault();
    
    // API login
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.addToast('Login successful!', 'success');
        window.location.href = '/';
      } else if (data.needsVerification) {
        localStorage.setItem('userEmail', email);
        setMessage('User not verified. Please verify your account first.');
        toast.addToast('⚠️ User not verified. Redirecting to verification...', 'warning');
        setTimeout(() => {
          setMessage('Redirecting to verification page...');
        }, 2000);
        setTimeout(() => {
          navigate('/otp-verify');
        }, 4000);
      } else {
        if (data.message.includes('Incorrect password')) {
          toast.addToast('❌ Incorrect password. Please try again.', 'error');
          setMessage('Incorrect password');
        } else if (data.message.includes('Email not found')) {
          toast.addToast('❌ Email not found. Please check your email address.', 'error');
          setMessage('Email not found');
        } else if (data.message.includes('verify')) {
          toast.addToast('✉️ Please verify your email first. Check your inbox.', 'error');
          setMessage(data.message);
        } else {
          toast.addToast(data.message, 'error');
          setMessage(data.message);
        }
      }
    } catch (error) {
      setMessage('Login failed');
      toast.addToast('Login failed', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(15, 23, 42, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div className="text-center mb-4">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.3)'
          }}>
            <i className="bi bi-person-circle text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Welcome Back!</h2>
          <p style={{ color: '#9ca3af' }}>Login to track your fitness journey</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '2px solid rgba(15, 23, 42, 0.2)',
                  padding: '12px 45px 12px 16px',
                  fontSize: '16px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(15, 23, 42, 0.6)',
                  cursor: 'pointer'
                }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn w-100"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Login
          </button>
        </form>
        
        {message && (
          <div className={`alert text-center mt-3 ${
            message.includes('not verified') || message.includes('Redirecting') ? 'alert-warning' : 'alert-danger'
          }`} style={{ borderRadius: '12px', border: '2px solid rgba(15, 23, 42, 0.2)', fontSize: '14px' }}>
            {message}
          </div>
        )}
        
        <div className="text-center mt-3">
          <p style={{ color: '#9ca3af', margin: '0.5rem 0' }}>Forgot your password? <a href="/forgot-password" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>Reset here</a></p>
          <p style={{ color: '#9ca3af', margin: '0.5rem 0' }}>Don't have an account? <a href="/signup" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;