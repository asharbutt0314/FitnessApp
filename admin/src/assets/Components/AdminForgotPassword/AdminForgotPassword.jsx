import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminResetEmail', email);
        localStorage.setItem('adminResetId', data.adminId);
        setMessage('🛡️ Admin reset code sent to your email!');
        setTimeout(() => navigate('/admin-reset-otp-verify'), 2000);
      } else {
        if (data.message.includes('not found')) {
          setMessage('❌ Admin email not found. Please check your email address.');
        } else if (data.message.includes('domain')) {
          setMessage('❌ Invalid email domain. Please use a valid email address.');
        } else {
          setMessage(data.message);
        }
      }
    } catch (error) {
      setMessage('Failed to send admin reset code');
    } finally {
      setLoading(false);
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
            <i className="bi bi-shield-exclamation text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Reset Password</h2>
          <p style={{ color: '#9ca3af' }}>Enter your email to reset password</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        {message && (
          <div className={`alert text-center mt-3 ${
            message.includes('🛡️') ? 'alert-success' : 'alert-danger'
          }`} style={{ borderRadius: '12px', fontSize: '14px' }}>
            {message}
          </div>
        )}
        
        <div className="text-center mt-3">
          <a href="/" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;