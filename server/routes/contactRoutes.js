import express from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  updateContactStatus
} from '../controllers/contactController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(submitContactMessage)
  .get(authenticateUser, authorizeRole('admin'), getAllContactMessages);

router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRole('admin'),
  validateObjectId('id'),
  updateContactStatus
);

export default router;

