import express from 'express';
import fs from 'fs';
import {
  applyForJob,
  getMyApplications,
  getAllApplicationsAdmin,
  getRecruiterApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  exportApplicationsCSV
} from '../controllers/applicationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateBody, validateObjectId } from '../middleware/validationMiddleware.js';
import { validateApplication, validateApplicationStatus } from '../validators/applicationValidator.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const router = express.Router();

// All application routes require authentication
router.use(authenticateUser);

// Verify magic bytes of uploaded file match genuine %PDF- signature
const verifyPdfMagicBytes = (filePath) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(5);
    const bytesRead = fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    return bytesRead === 5 && buf.toString('utf8') === '%PDF-';
  } catch {
    return false;
  }
};

// Resume upload route (PDF only, max 5MB + magic-byte signature validation)
router.post('/upload-resume', (req, res) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      return sendError(res, 400, err.message || 'File upload failed');
    }
    if (!req.file) {
      return sendError(res, 400, 'Please select a valid PDF file to upload');
    }

    if (!verifyPdfMagicBytes(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore cleanup error
      }
      return sendError(res, 400, 'Uploaded file is not a genuine PDF document');
    }

    return sendSuccess(res, 200, 'Resume uploaded successfully', {
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      resumeUrl: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size
    });
  });
});

// Submit application (Candidate)
router.route('/')
  .post(authorizeRole('candidate'), validateBody(validateApplication), applyForJob);

// Candidate applications
router.get('/my', getMyApplications);

// Admin platform applications monitor
router.get('/admin', authorizeRole('admin'), getAllApplicationsAdmin);

// Recruiter applications for their posted jobs (or all for admin)
router.get('/recruiter', authorizeRole('recruiter', 'admin'), getRecruiterApplications);

// CSV Export for recruiter / admin
router.get('/export/csv', authorizeRole('recruiter', 'admin'), exportApplicationsCSV);

router.route('/:id')
  .get(validateObjectId('id'), getApplicationById)
  .delete(validateObjectId('id'), deleteApplication);

router.put(
  '/:id/status',
  authorizeRole('recruiter', 'admin'),
  validateObjectId('id'),
  validateBody(validateApplicationStatus),
  updateApplicationStatus
);

export default router;
