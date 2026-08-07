import express from 'express';
import {
  getAllUsers,
  getVerifierRequests,
  decideVerifierRequest,
  removeUser,
  getAllCertificates,
  getAdminHistory,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('admin')); // every route below this line requires admin

router.get('/users', getAllUsers);
router.patch('/users/:id/remove', removeUser);
router.get('/verifier-requests', getVerifierRequests);
router.patch('/verifier-requests/:id', decideVerifierRequest);
router.get('/certificates', getAllCertificates);
router.get('/history', getAdminHistory);

export default router;
