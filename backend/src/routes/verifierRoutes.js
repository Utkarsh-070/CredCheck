import express from 'express';
import {
  getPendingCertificates,
  decideCertificate,
  getVerifierHistory,
  applyAsVerifier,
} from '../controllers/verifierController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public — anyone can apply for their org to become a verifier, no login required
router.post('/apply', applyAsVerifier);

router.get('/requests', protect, requireRole('verifier'), getPendingCertificates);
router.patch('/requests/:id', protect, requireRole('verifier'), decideCertificate);
router.get('/history', protect, requireRole('verifier'), getVerifierHistory);

export default router;
