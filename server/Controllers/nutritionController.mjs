import Nutrition from '../Models/Nutrition.mjs';
import { Hydration } from '../Models/Progress.mjs';

export const getNutritionByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const nutrition = await Nutrition.find({ 
      userId: req.user.id, 
      date: new Date(date) 
    });
    res.json({ success: true, nutrition });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addNutritionEntry = async (req, res) => {
  try {
    const { date, mealType, foodItem, quantity, calories, protein, carbs, fat } = req.body;
    
    const nutrition = new Nutrition({
      userId: req.user.id,
      date: new Date(date),
      mealType,
      foodItem,
      quantity,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0
    });
    
    await nutrition.save();
    res.status(201).json({ success: true, nutrition });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateNutritionEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const nutrition = await Nutrition.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }
    
    res.json({ success: true, nutrition });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNutritionEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const nutrition = await Nutrition.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }
    
    res.json({ success: true, message: 'Nutrition entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHydration = async (req, res) => {
  try {
    const { date } = req.params;
    let hydration = await Hydration.findOne({ 
      userId: req.user.id, 
      date: new Date(date) 
    });
    
    if (!hydration) {
      hydration = new Hydration({
        userId: req.user.id,
        date: new Date(date),
        glasses: 0
      });
      await hydration.save();
    }
    
    res.json({ success: true, hydration });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHydration = async (req, res) => {
  try {
    const { date } = req.params;
    const { glasses } = req.body;
    
    const hydration = await Hydration.findOneAndUpdate(
      { userId: req.user.id, date: new Date(date) },
      { glasses },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, hydration });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};