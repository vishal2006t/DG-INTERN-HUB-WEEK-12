import express from 'express';
import {
  getPublicStats,
  getAdminAnalytics,
  getRecruiterAnalytics
} from '../controllers/analyticsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public live statistics for landing page
router.get('/public', getPublicStats);

// Protected analytics routes
router.use(authenticateUser);

router.get('/admin', authorizeRole('admin'), getAdminAnalytics);
router.get('/recruiter', authorizeRole('recruiter', 'admin'), getRecruiterAnalytics);

export default router;
