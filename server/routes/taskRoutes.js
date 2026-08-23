import { Router } from 'express';
import { deleteTask, moveTask, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();
router.use(protect);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/status', moveTask);
export default router;