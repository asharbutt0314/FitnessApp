import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  bodyFat: Number,
  muscleMass: Number,
  notes: String
}, {
  timestamps: true
});

const hydrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  glasses: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Progress = mongoose.model('Progress', progressSchema);
export const Hydration = mongoose.model('Hydration', hydrationSchema);