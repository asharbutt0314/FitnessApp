import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast/ToastProvider';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    fitnessGoal: '',
    activityLevel: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();



  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    // Strong password validation
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.password)) {
      setPasswordError('Password must be at least 8 characters, include uppercase, lowercase, number, and special character.');
      return;
    }
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
        fitnessGoal: formData.fitnessGoal,
        activityLevel: formData.activityLevel
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userEmail', formData.email);
        toast.addToast(data.message, 'success');
        navigate('/otp-verify');
      } else {
        if (data.message.includes('Email already exists')) {
          setMessage('Email already registered. Redirecting to login...');
          toast.addToast('Email already registered. Redirecting to login...', 'error');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(data.message);
          toast.addToast(data.message, 'error');
        }
      }
    } catch (error) {
      setMessage('Registration failed');
      toast.addToast('Registration failed', 'error');
    }
  };

  React.useEffect(() => {
    let timeout;
    if (message) {
      timeout = setTimeout(() => setMessage(''), 3000);
    }
    return () => clearTimeout(timeout);
  }, [message]);

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
            <i className="bi bi-person-plus text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Join FitZone!</h2>
          <p style={{ color: '#9ca3af' }}>Create account to start your fitness journey</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Gender</label>
            <select
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Age</label>
            <input
              type="number"
              name="age"
              className="form-control"
              value={formData.age}
              onChange={handleChange}
              required
              min="13"
              max="100"
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Height (cm)</label>
            <input
              type="number"
              name="height"
              className="form-control"
              value={formData.height}
              onChange={handleChange}
              required
              min="100"
              max="250"
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              className="form-control"
              value={formData.weight}
              onChange={handleChange}
              required
              min="30"
              max="300"
              step="0.1"
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Fitness Goal</label>
            <select
              name="fitnessGoal"
              className="form-control"
              value={formData.fitnessGoal}
              onChange={handleChange}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Fitness Goal</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Activity Level</label>
            <select
              name="activityLevel"
              className="form-control"
              value={formData.activityLevel}
              onChange={handleChange}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (3-5 days/week)</option>
              <option value="very_active">Very Active (6-7 days/week)</option>
              <option value="extremely_active">Extremely Active (2x/day or intense)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
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
            {passwordError && (
              <div className="text-danger mt-2" style={{ fontSize: '0.95em' }}>{passwordError}</div>
            )}
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
            Create Account
          </button>
        </form>
        
        {message && (
          <div className={`alert text-center mt-3 ${
            message.includes('Redirecting') ? 'alert-warning' : 'alert-success'
          }`} style={{ borderRadius: '12px', border: '2px solid rgba(15, 23, 42, 0.2)' }}>
            {message}
          </div>
        )}
        
        <div className="text-center mt-3">
          <p style={{ color: '#9ca3af', margin: '0' }}>Already have an account? <a href="/login" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;