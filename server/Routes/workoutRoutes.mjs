import express from 'express';
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout, completeWorkout } from '../Controllers/workoutController.mjs';
import { authenticateToken } from '../Middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWorkouts);
router.post('/', createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);
router.put('/:id/complete', completeWorkout);

export default router;