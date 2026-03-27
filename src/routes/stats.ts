import { Router } from 'express';
import * as statsController from '../controllers/statsController';

const router = Router();

// GET /api/stats - Get registry statistics
router.get('/', statsController.getStats);

// GET /api/stats/category/:category - Get stats for specific category
router.get('/category/:category', statsController.getCategoryStats);

export default router;
