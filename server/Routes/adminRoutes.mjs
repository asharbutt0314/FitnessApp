import express from 'express';
import { register, login, forgotPassword, verifyResetOTP, resetPassword, verifyOTP, resendOTP, getAllUsers, updateUser, deleteUser, getAllTrainers, addTrainer, updateTrainer, deleteTrainer, getDashboardStats, getAllWorkouts, deleteWorkout, getAllNutrition, deleteNutrition, getAdminProfile, updateAdminProfile } from '../Controllers/adminController.mjs';
import { authenticateAdmin } from '../middleware/adminAuth.mjs';

const router = express.Router();

// Auth routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected admin routes
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateAdminProfile);
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);
router.get('/users', authenticateAdmin, getAllUsers);
router.put('/users/:id', authenticateAdmin, updateUser);
router.delete('/users/:id', authenticateAdmin, deleteUser);

router.get('/trainers', authenticateAdmin, getAllTrainers);
router.post('/trainers', authenticateAdmin, addTrainer);
router.put('/trainers/:id', authenticateAdmin, updateTrainer);
router.delete('/trainers/:id', authenticateAdmin, deleteTrainer);

router.get('/workouts', authenticateAdmin, getAllWorkouts);
router.delete('/workouts/:id', authenticateAdmin, deleteWorkout);

router.get('/nutrition', authenticateAdmin, getAllNutrition);
router.delete('/nutrition/:id', authenticateAdmin, deleteNutrition);

export default router;