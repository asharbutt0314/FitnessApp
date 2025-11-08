import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from '../Toast/ToastProvider';

const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = localStorage.getItem('userEmail');
      console.log('Verifying OTP for email:', email);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('userEmail');
        toast.addToast('Email verified and logged in successfully!', 'success');
        navigate('/dashboard');
      } else {
        toast.addToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.addToast('Verification failed', 'error');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      toast.addToast(data.message, data.success ? 'success' : 'error');
    } catch (error) {
      toast.addToast('Failed to resend OTP', 'error');
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
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Verify Email</h2>
          <p style={{ color: '#9ca3af' }}>Enter the 6-digit code sent to your email</p>
        </div>
        
        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '18px',
                letterSpacing: '2px'
              }}
            />
          </div>
          
          <button
            type="submit"
            className="btn w-100 mb-3"
            disabled={loading}
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
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        <div className="text-center">
          <button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(15, 23, 42, 0.95)',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;