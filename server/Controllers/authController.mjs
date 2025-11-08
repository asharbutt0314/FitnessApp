import jwt from 'jsonwebtoken';
import User from '../Models/User.mjs';
import { sendOTPEmail, sendPasswordResetEmail } from '../Services/emailService.mjs';
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
    const { username, email, password, gender, age, height, weight, fitnessGoal, activityLevel } = req.body;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate email domain
    const isDomainValid = await validateEmailDomain(email);
    console.log('Domain validation for', email, ':', isDomainValid);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      if (!existingEmail.isVerified) {
        return res.status(400).json({ message: 'Email already registered. Please verify your account.' });
      }
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken. Please change the username.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Validate email existence by attempting to send
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.log('Email validation failed:', emailError.message);
      if (emailError.code === 'EENVELOPE' || emailError.responseCode === 550 || emailError.message.includes('No such user')) {
        return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
      }
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }

    // Create user only if email sent successfully
    const user = new User({ 
      username,
      email, 
      password, 
      gender,
      age,
      height,
      weight,
      fitnessGoal,
      activityLevel,
      otp, 
      otpExpires 
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first',
        needsVerification: true,
        userId: user._id
      });
    }

    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;
    delete userResponse.resetOtp;
    delete userResponse.resetOtpExpires;
    
    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verify OTP request:', { email, otp });

    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    console.log('OTP comparison:', { userOTP: user.otp, providedOTP: otp, expires: user.otpExpires, now: new Date() });
    if (!user.otp) {
      console.log('No OTP found for user');
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }
    
    if (user.otp !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.otpExpires < new Date()) {
      console.log('OTP expired');
      return res.status(400).json({ message: 'OTP has expired' });
    }

    console.log('OTP verification successful, updating user');
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Sending success response');
    const userResponse = user.toObject();
    console.log('Full user object from database:', userResponse);
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;
    delete userResponse.resetOtp;
    delete userResponse.resetOtpExpires;
    
    res.json({
      success: true,
      message: 'Email verified and logged in successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.log('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email domain
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.log('Email validation failed:', emailError.message);
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, gender, age, height, weight, fitnessGoal, activityLevel } = req.body;
    
    // Check if user is updating their own profile
    if (req.user.id.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { username, gender, age, height, weight, fitnessGoal, activityLevel },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -resetOtp -resetOtpExpires');
    
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

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpires');
    res.json({ success: true, users });
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
    console.log('User forgot password - Domain validation for', email, ':', isDomainValid);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist. Please check and try again.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    try {
      await sendPasswordResetEmail(email, otp);
    } catch (emailError) {
      console.log('User reset email failed:', emailError.message);
      return res.status(400).json({ message: 'Email does not exist. Please check and try again.' });
    }
    
    res.json({ success: true, message: 'OTP sent to email', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);
    
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};