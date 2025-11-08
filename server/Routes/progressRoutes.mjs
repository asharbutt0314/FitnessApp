import express from 'express';
import { getProgressHistory, addProgressEntry, updateProgressEntry, deleteProgressEntry, getStats } from '../Controllers/progressController.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProgressHistory);
router.post('/', addProgressEntry);
router.put('/:id', updateProgressEntry);
router.delete('/:id', deleteProgressEntry);
router.get('/stats', getStats);

export default router;