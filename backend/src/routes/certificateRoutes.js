import express from 'express';
import {
  uploadCertificate,
  getMyCertificates,
  getCertificateById,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, requireRole('student'), upload.single('file'), uploadCertificate);
router.get('/mine', protect, requireRole('student'), getMyCertificates);
router.get('/:id', protect, requireRole('student'), getCertificateById);

export default router;
