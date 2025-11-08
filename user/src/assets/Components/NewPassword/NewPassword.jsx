import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast/ToastProvider';

const NewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.addToast('Passwords do not match', 'error');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.newPassword)) {
      toast.addToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error');
      return;
    }

    setLoading(true);

    const userId = localStorage.getItem('resetUserId');
    const otp = localStorage.getItem('resetOTP'); // Get OTP from previous step
    
    if (!userId || !otp) {
      toast.addToast('Session expired. Please start over.', 'error');
      navigate('/forgot-password');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          otp, 
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetUserId');
        localStorage.removeItem('resetOTP');
        toast.addToast('🎉 Password reset successfully! You can now login with your new password.', 'success');
        navigate('/login');
      } else {
        if (data.message.includes('Invalid') || data.message.includes('expired')) {
          toast.addToast('❌ Invalid or expired reset code. Please try again.', 'error');
        } else {
          toast.addToast(data.message, 'error');
        }
      }
    } catch (error) {
      toast.addToast('Password reset failed', 'error');
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <i className="bi bi-key text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Create New Password</h2>
          <p style={{ color: '#9ca3af' }}>Enter your new secure password</p>
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
              placeholder="Enter new password"
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
              placeholder="Confirm new password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn w-100"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
        
        <div className="text-center mt-3">
          <p style={{ color: '#9ca3af', margin: '0' }}>
            <a href="/login" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;