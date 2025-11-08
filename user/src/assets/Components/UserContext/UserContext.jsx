import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const updateUserProfile = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      const userId = user._id || user.id;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      if (data.success) {
        const updatedUser = data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, message: 'Error updating profile' };
    }
  };

  const updateWeight = async (newWeight) => {
    try {
      const result = await updateUserProfile({ weight: newWeight });
      if (result.success) {
        toast.addToast('Weight updated successfully', 'success');
        return true;
      } else {
        toast.addToast(result.message || 'Failed to update weight', 'error');
        return false;
      }
    } catch (error) {
      toast.addToast('Error updating weight', 'error');
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = user._id || user.id;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        const updatedUser = data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    updateUserProfile,
    updateWeight,
    refreshUser,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};