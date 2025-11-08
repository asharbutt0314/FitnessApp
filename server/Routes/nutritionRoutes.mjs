import express from 'express';
import { getNutritionByDate, addNutritionEntry, updateNutritionEntry, deleteNutritionEntry, getHydration, updateHydration } from '../Controllers/nutritionController.mjs';
import { authenticateToken } from '../Middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/:date', getNutritionByDate);
router.post('/', addNutritionEntry);
router.put('/:id', updateNutritionEntry);
router.delete('/:id', deleteNutritionEntry);
router.get('/hydration/:date', getHydration);
router.put('/hydration/:date', updateHydration);

export default router;