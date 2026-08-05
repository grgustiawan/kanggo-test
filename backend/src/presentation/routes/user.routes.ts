import { Router } from 'express';
import * as userHandler from '../handlers/user.handler';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', userHandler.list);
router.post('/', authorize('admin'), userHandler.create);
router.put('/:id', authorize('admin'), userHandler.update);
router.delete('/:id', authorize('admin'), userHandler.remove);

export default router;
