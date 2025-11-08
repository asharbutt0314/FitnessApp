import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  resetOtp: {
    type: String
  },
  resetOtpExpires: {
    type: Date
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 100
  },
  height: {
    type: Number,
    required: true,
    min: 100,
    max: 250
  },
  weight: {
    type: Number,
    required: true,
    min: 30,
    max: 300
  },
  fitnessGoal: {
    type: String,
    required: true,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance']
  },
  activityLevel: {
    type: String,
    required: true,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
  },
  profile: {
    firstName: String,
    lastName: String,
    profilePicture: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);