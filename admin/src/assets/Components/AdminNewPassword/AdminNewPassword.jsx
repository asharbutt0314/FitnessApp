import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.newPassword)) {
      setMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      return;
    }

    setLoading(true);

    const adminId = localStorage.getItem('adminResetId');
    const otp = localStorage.getItem('adminResetOTP');
    
    if (!adminId || !otp) {
      setMessage('Session expired. Please start over.');
      setTimeout(() => navigate('/admin-forgot-password'), 2000);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminId, 
          otp, 
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('adminResetEmail');
        localStorage.removeItem('adminResetId');
        localStorage.removeItem('adminResetOTP');
        setMessage('🛡️ Admin password reset successfully! You can now login with your new password.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        if (data.message.includes('Invalid') || data.message.includes('expired')) {
          setMessage('❌ Invalid or expired reset code. Please try again.');
        } else {
          setMessage(data.message);
        }
      }
    } catch (error) {
      setMessage('Admin password reset failed');
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
            <i className="bi bi-key-fill text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>New Password</h2>
          <p style={{ color: '#9ca3af' }}>Create your new secure password</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              value={formData.newPassword}
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
          
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
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
            {loading ? 'Updating...' : 'Update Password'}
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

export default AdminNewPassword;