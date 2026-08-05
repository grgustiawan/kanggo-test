import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import summaryRoutes from './summary.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/summary', summaryRoutes);
router.use('/users', userRoutes);

export default router;
