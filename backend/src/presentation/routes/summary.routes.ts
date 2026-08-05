import { Router } from 'express';
import * as summaryHandler from '../handlers/summary.handler';

const router = Router();

router.get('/', summaryHandler.getSummary);

export default router;
