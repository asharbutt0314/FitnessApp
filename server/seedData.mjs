import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trainer from './Models/Trainer.mjs';
import Workout from './Models/Workout.mjs';
import Nutrition from './Models/Nutrition.mjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Trainer.deleteMany({});
    await Workout.deleteMany({});
    await Nutrition.deleteMany({});

    // Seed Trainers
    const trainers = await Trainer.insertMany([
      {
        name: 'Alex Johnson',
        email: 'alex@fitzone.com',
        specialization: 'Strength Training',
        experience: '5 years',
        status: 'Active'
      },
      {
        name: 'Sarah Davis',
        email: 'sarah@fitzone.com',
        specialization: 'Yoga & Flexibility',
        experience: '3 years',
        status: 'Active'
      },
      {
        name: 'Mike Chen',
        email: 'mike@fitzone.com',
        specialization: 'Cardio & HIIT',
        experience: '4 years',
        status: 'Inactive'
      },
      {
        name: 'Emma Wilson',
        email: 'emma@fitzone.com',
        specialization: 'Pilates',
        experience: '6 years',
        status: 'Active'
      },
      {
        name: 'David Brown',
        email: 'david@fitzone.com',
        specialization: 'CrossFit',
        experience: '7 years',
        status: 'Active'
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa@fitzone.com',
        specialization: 'Zumba',
        experience: '2 years',
        status: 'Active'
      }
    ]);

    // Seed Workouts (using dummy user IDs)
    const dummyUserId = new mongoose.Types.ObjectId();
    await Workout.insertMany([
      {
        userId: dummyUserId,
        name: 'Morning Cardio',
        category: 'cardio',
        exercises: [
          { name: 'Running', sets: 1, reps: 30, weight: 0 },
          { name: 'Jumping Jacks', sets: 3, reps: 20, weight: 0 }
        ],
        duration: 45,
        caloriesBurned: 300,
        isCompleted: true
      },
      {
        userId: dummyUserId,
        name: 'Strength Training',
        category: 'strength',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15, weight: 0 },
          { name: 'Squats', sets: 3, reps: 20, weight: 50 }
        ],
        duration: 60,
        caloriesBurned: 250,
        isCompleted: false
      }
    ]);

    // Seed Nutrition
    await Nutrition.insertMany([
      {
        userId: dummyUserId,
        date: new Date(),
        mealType: 'breakfast',
        foodItem: 'Oatmeal with fruits',
        quantity: '1 bowl',
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 8
      },
      {
        userId: dummyUserId,
        date: new Date(),
        mealType: 'lunch',
        foodItem: 'Grilled Chicken Salad',
        quantity: '1 plate',
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 15
      }
    ]);

    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();