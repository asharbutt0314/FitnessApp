import Workout from '../Models/Workout.mjs';

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, workouts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const { name, category, exercises } = req.body;
    
    const workout = new Workout({
      userId: req.user.id,
      name,
      category,
      exercises
    });
    
    await workout.save();
    res.status(201).json({ success: true, workout });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ success: true, workout });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const completeWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, caloriesBurned } = req.body;
    
    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { 
        isCompleted: true, 
        completedAt: new Date(),
        duration: duration || 0,
        caloriesBurned: caloriesBurned || 0
      },
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ success: true, workout });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};