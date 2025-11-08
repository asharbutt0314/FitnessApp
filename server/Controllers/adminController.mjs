import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin from '../Models/Admin.mjs';
import User from '../Models/User.mjs';
import Trainer from '../Models/Trainer.mjs';
import Workout from '../Models/Workout.mjs';
import Nutrition from '../Models/Nutrition.mjs';
import { sendAdminOTPEmail, sendAdminPasswordResetEmail } from '../Services/adminEmailService.mjs';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

const validateEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    return false;
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate email domain
    const isDomainValid = await validateEmailDomain(email);
    console.log('Admin registration - Domain validation for', email, ':', isDomainValid);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    const existingUsername = await Admin.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken. Please change the username.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Send OTP first
    try {
      await sendAdminOTPEmail(email, otp);
    } catch (emailError) {
      console.log('Admin email validation failed:', emailError.message);
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }

    // Create admin with OTP
    const admin = new Admin({ 
      username,
      email, 
      password, 
      gender,
      otp,
      otpExpires
    });
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registration successful. Please check your email for verification code.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate email domain
    const isDomainValid = await validateEmailDomain(email);
    console.log('Admin login - Domain validation for', email, ':', isDomainValid);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    if (!admin.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first',
        needsVerification: true
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate email domain
    const isDomainValid = await validateEmailDomain(email);
    console.log('Admin forgot password - Domain validation for', email, ':', isDomainValid);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }
    
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    admin.resetOtp = otp;
    admin.resetOtpExpires = otpExpires;
    await admin.save();

    try {
      await sendAdminPasswordResetEmail(email, otp);
    } catch (emailError) {
      console.log('Admin reset email failed:', emailError.message);
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }
    
    res.json({ success: true, message: 'OTP sent to email', adminId: admin._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;
    const admin = await Admin.findById(adminId);
    
    if (!admin || admin.resetOtp !== otp || admin.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { adminId, otp, newPassword } = req.body;
    const admin = await Admin.findById(adminId);
    
    if (!admin || admin.resetOtp !== otp || admin.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    admin.password = newPassword;
    admin.resetOtp = undefined;
    admin.resetOtpExpires = undefined;
    await admin.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Admin verify OTP request:', { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    if (!admin.otp || admin.otp !== otp || admin.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Email verified and logged in successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    if (admin.isVerified) {
      return res.status(400).json({ message: 'Admin already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    admin.otp = otp;
    admin.otpExpires = otpExpires;
    await admin.save();

    try {
      await sendAdminOTPEmail(admin.email, otp);
    } catch (emailError) {
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Users Management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, isVerified } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Trainers Management
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({}).sort({ createdAt: -1 });
    res.json({ success: true, trainers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addTrainer = async (req, res) => {
  try {
    const { name, email, specialization, experience, status } = req.body;
    
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ message: 'Trainer with this email already exists' });
    }
    
    const trainer = new Trainer({ name, email, specialization, experience, status });
    await trainer.save();
    
    res.json({ success: true, trainer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, experience, status } = req.body;
    
    const trainer = await Trainer.findByIdAndUpdate(id, 
      { name, specialization, experience, status }, 
      { new: true }
    );
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.json({ success: true, trainer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trainer = await Trainer.findByIdAndDelete(id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Users Stats
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const pendingUsers = await User.countDocuments({ isVerified: false });
    
    // Trainers Stats
    const totalTrainers = await Trainer.countDocuments();
    const activeTrainers = await Trainer.countDocuments({ status: 'Active' });
    
    // Workouts Stats
    const totalWorkouts = await Workout.countDocuments();
    const completedWorkouts = await Workout.countDocuments({ isCompleted: true });
    
    // Nutrition Stats
    const totalNutritionEntries = await Nutrition.countDocuments();
    const uniqueNutritionUsers = await Nutrition.distinct('userId').then(users => users.length);
    
    // Time-based stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentWorkouts = await Workout.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const monthlyActiveUsers = await User.countDocuments({ 
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { updatedAt: { $gte: thirtyDaysAgo } }
      ]
    });
    
    // Calculate total calories burned
    const totalCaloriesBurned = await Workout.aggregate([
      { $group: { _id: null, total: { $sum: '$caloriesBurned' } } }
    ]).then(result => result[0]?.total || 0);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        pendingUsers,
        totalTrainers,
        activeTrainers,
        totalWorkouts,
        completedWorkouts,
        totalNutritionEntries,
        uniqueNutritionUsers,
        recentUsers,
        recentWorkouts,
        monthlyActiveUsers,
        totalCaloriesBurned
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Workouts Management
export const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({}).populate('userId', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, workouts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findByIdAndDelete(id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Nutrition Management
export const getAllNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.find({}).populate('userId', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, nutrition });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNutrition = async (req, res) => {
  try {
    const { id } = req.params;
    const nutrition = await Nutrition.findByIdAndDelete(id);
    
    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }
    
    res.json({ success: true, message: 'Nutrition entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin Profile Management
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const admin = await Admin.findByIdAndUpdate(req.admin.id, updateData, { new: true }).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};