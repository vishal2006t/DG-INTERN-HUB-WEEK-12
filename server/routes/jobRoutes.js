import express from 'express';
import {
  getJobs,
  getJobFilters,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';
import { authenticateUser, optionalAuth } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { validateJob } from '../validators/jobValidator.js';

const router = express.Router();

// Dynamic filter facets (must come before /:id route)
router.get('/filters', getJobFilters);

router.route('/')
  .get(optionalAuth, getJobs)
  .post(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    validateBody((body) => validateJob(body, false)),
    createJob
  );

router.route('/:id')
  .get(getJobById)
  .put(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    validateBody((body) => validateJob(body, true)),
    updateJob
  )
  .delete(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    deleteJob
  );

export default router;
