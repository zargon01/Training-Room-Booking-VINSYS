import express from 'express';
import { getAdminStats } from '../controllers/stats.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/stats/admin
router.get('/admin', protect, isAdmin, getAdminStats);

export default router;
