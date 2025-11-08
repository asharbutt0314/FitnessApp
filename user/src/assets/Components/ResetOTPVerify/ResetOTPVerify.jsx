import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast/ToastProvider';

const ResetOTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem('resetUserId');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('resetOTP', otp);
        toast.addToast('OTP verified successfully!', 'success');
        navigate('/new-password');
      } else {
        if (data.message.includes('Invalid') || data.message.includes('expired')) {
          toast.addToast('❌ Invalid or expired OTP. Please check the code or request a new one.', 'error');
        } else if (data.message.includes('not found')) {
          toast.addToast('❌ User not found. Please register first.', 'error');
        } else {
          toast.addToast(data.message, 'error');
        }
      }
    } catch (error) {
      toast.addToast('OTP verification failed', 'error');
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
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
          }}>
            <i className="bi bi-shield-check text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Verify Reset Code</h2>
          <p style={{ color: '#9ca3af' }}>Enter the 6-digit code sent to your email</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Verification Code</label>
            <input
              type="text"
              className="form-control text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '24px',
                letterSpacing: '8px',
                fontWeight: 'bold'
              }}
              placeholder="000000"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn w-100"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <p style={{ color: '#9ca3af', margin: '0' }}>
            Didn't receive code? 
            <a href="/forgot-password" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }}>
              Resend
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetOTPVerify;