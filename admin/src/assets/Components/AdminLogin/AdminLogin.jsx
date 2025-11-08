import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/api';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/api/admin/login', { email, password });
      const data = response.data;

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        setMessage('<i class="bi bi-check-circle-fill"></i> Admin login successful!');
        setTimeout(() => {
          onLogin();
          navigate('/');
        }, 1000);
      } else if (data.needsVerification) {
        localStorage.setItem('adminEmail', email);
        setMessage('<i class="bi bi-exclamation-circle-fill"></i> Please verify your admin email first');
        setTimeout(() => navigate('/admin-otp-verify'), 2000);
      } else {
        if (data.message.includes('Incorrect password')) {
          setMessage('<i class="bi bi-x-circle-fill"></i> Incorrect password. Please try again.');
        } else if (data.message.includes('Email not found')) {
          setMessage('<i class="bi bi-x-circle-fill"></i> Admin email not found. Please check your email address.');
        } else {
          setMessage(data.message);
        }
      }
    } catch (error) {
      setMessage('Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let timeout;
    if (message) {
      timeout = setTimeout(() => setMessage(''), 5000);
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
            <i className="bi bi-shield-lock text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Admin Login</h2>
          <p style={{ color: '#9ca3af' }}>Access FitZone Admin Panel</p>
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
            disabled={loading}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {message && (
          <div className={`alert text-center mt-3 ${
            message.includes('check-circle-fill') ? 'alert-success' : 'alert-danger'
          }`} style={{ borderRadius: '12px', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: message }}>
          </div>
        )}
        
        <div className="text-center mt-3">
          <p style={{ color: '#9ca3af', margin: '0.5rem 0' }}>
            Forgot your password? 
            <a href="/admin-forgot-password" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }}>
              Reset here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;