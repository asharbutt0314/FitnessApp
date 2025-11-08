import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';
import { useUser } from '../UserContext/UserContext';
import './Profile.css';

const Profile = () => {
  const { user, loading, updateUserProfile, setUser } = useUser();
  const [localUser, setLocalUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setLocalUser({ ...user });
    }
  }, [user]);

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const result = await updateUserProfile({
        username: localUser.username,
        gender: localUser.gender,
        age: localUser.age,
        height: localUser.height,
        weight: localUser.weight,
        fitnessGoal: localUser.fitnessGoal,
        activityLevel: localUser.activityLevel
      });
      
      if (result.success) {
        toast.addToast('Profile updated successfully', 'success');
      } else {
        toast.addToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.addToast('Error updating profile', 'error');
    }
    setUpdating(false);
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.addToast('New passwords do not match', 'error');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(passwordData.newPassword)) {
      toast.addToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const userId = user._id || user.id;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.addToast('Password changed successfully', 'success');
      } else {
        toast.addToast(data.message || 'Password change failed', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.addToast('Error changing password', 'error');
    }
    setChangingPassword(false);
  };

  const sendForgotOtp = async () => {
    setSendingOtp(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email })
      });
      
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        toast.addToast('OTP sent to your email', 'success');
      } else {
        toast.addToast(data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      toast.addToast('Error sending OTP', 'error');
    }
    setSendingOtp(false);
  };

  const resetPasswordWithOtp = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.addToast('New passwords do not match', 'error');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(passwordData.newPassword)) {
      toast.addToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          otp: passwordData.otp,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setForgotMode(false);
        setOtpSent(false);
        toast.addToast('Password reset successfully', 'success');
      } else {
        toast.addToast(data.message || 'Password reset failed', 'error');
      }
    } catch (error) {
      toast.addToast('Error resetting password', 'error');
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (!user || !localUser) {
    return (
      <div className="profile-container">
        <h2>Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <div className="profile-content">
        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-person-fill"></i> Personal Information</h3>
          </div>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{localUser.username || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{localUser.email || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{localUser.gender ? localUser.gender.charAt(0).toUpperCase() + localUser.gender.slice(1) : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{localUser.age ? `${localUser.age} years` : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Height</span>
              <span className="info-value">{localUser.height ? `${localUser.height} cm` : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Weight</span>
              <span className="info-value">{localUser.weight ? `${localUser.weight} kg` : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fitness Goal</span>
              <span className="info-value">{localUser.fitnessGoal ? localUser.fitnessGoal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Activity Level</span>
              <span className="info-value">{localUser.activityLevel ? localUser.activityLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Verified</span>
              <span className="info-value">{user.isVerified ? 'Yes' : 'No'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not specified'}</span>
            </div>
          </div>
        </div>



        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-pencil-square"></i> Edit Profile</h3>
          </div>
          <div className="profile-form">
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={localUser.username || ''}
                onChange={(e) => setLocalUser({...localUser, username: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                value={localUser.gender || ''}
                onChange={(e) => setLocalUser({...localUser, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input 
                type="number" 
                value={localUser.age || ''}
                onChange={(e) => setLocalUser({...localUser, age: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input 
                type="number" 
                value={localUser.height || ''}
                onChange={(e) => setLocalUser({...localUser, height: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={localUser.weight || ''}
                onChange={(e) => setLocalUser({...localUser, weight: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select 
                value={localUser.fitnessGoal || ''}
                onChange={(e) => setLocalUser({...localUser, fitnessGoal: e.target.value})}
              >
                <option value="">Select Goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select 
                value={localUser.activityLevel || ''}
                onChange={(e) => setLocalUser({...localUser, activityLevel: e.target.value})}
              >
                <option value="">Select Level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extremely_active">Extremely Active</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setLocalUser({ ...user });
              }}>Cancel</button>
              <button className="btn-primary" onClick={updateProfile} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="bi bi-lock-fill"></i> Change Password</h3>
          </div>
          <div className="profile-form">
            {!forgotMode && (
              <div className="form-group">
                <label>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`bi ${showPasswords.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setForgotMode(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}
            
            {forgotMode && !otpSent && (
              <div className="form-group">
                <p style={{ color: '#666', marginBottom: '15px' }}>We'll send an OTP to your email: {user.email}</p>
                <button 
                  className="btn-primary" 
                  onClick={sendForgotOtp} 
                  disabled={sendingOtp}
                  style={{ width: '100%' }}
                >
                  {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setForgotMode(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Back to Current Password
                  </button>
                </div>
              </div>
            )}
            
            {forgotMode && otpSent && (
              <div className="form-group">
                <label>Enter OTP</label>
                <input 
                  type="text"
                  value={passwordData.otp}
                  onChange={(e) => setPasswordData({...passwordData, otp: e.target.value})}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
              </div>
            )}
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
                setForgotMode(false);
                setOtpSent(false);
              }}>Clear</button>
              {!forgotMode ? (
                <button className="btn-primary" onClick={changePassword} disabled={changingPassword}>
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              ) : otpSent ? (
                <button className="btn-primary" onClick={resetPasswordWithOtp} disabled={changingPassword}>
                  {changingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;