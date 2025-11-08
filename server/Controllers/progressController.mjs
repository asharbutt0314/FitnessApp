import { Progress } from '../Models/Progress.mjs';
import Workout from '../Models/Workout.mjs';
import User from '../Models/User.mjs';

export const getProgressHistory = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addProgressEntry = async (req, res) => {
  try {
    const { date, weight, bodyFat, muscleMass, notes } = req.body;
    
    const progress = new Progress({
      userId: req.user.id,
      date: new Date(date),
      weight,
      bodyFat,
      muscleMass,
      notes
    });
    
    await progress.save();
    
    // Update user's current weight if weight is provided
    if (weight) {
      await User.findByIdAndUpdate(req.user.id, { weight });
    }
    
    res.status(201).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProgressEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await Progress.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProgressEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await Progress.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }
    
    res.json({ success: true, message: 'Progress entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const completedWorkouts = await Workout.find({ 
      userId: req.user.id, 
      isCompleted: true 
    });
    
    const totalWorkouts = completedWorkouts.length;
    const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalMinutes = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    // This week workouts
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekWorkouts = completedWorkouts.filter(w => 
      w.completedAt >= weekStart
    ).length;
    
    res.json({ 
      success: true, 
      stats: {
        totalWorkouts,
        thisWeekWorkouts,
        totalCalories,
        totalMinutes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};