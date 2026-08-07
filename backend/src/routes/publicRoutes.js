import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

// GET /api/public/cert/:publicLinkId — no auth. What a recruiter sees after
// opening the link or scanning the QR code.
router.get(
  '/cert/:publicLinkId',
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({
      publicLinkId: req.params.publicLinkId,
      status: 'verified',
    })
      .populate('studentId', 'name college')
      .populate('verifiedBy', 'organizationName name');

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found or not verified');
    }

    // Deliberately shape the response — never send the raw Mongo doc to a
    // public, unauthenticated route.
    res.json({
      studentName: certificate.studentId.name,
      college: certificate.studentId.college,
      title: certificate.title,
      organization: certificate.organization,
      description: certificate.description,
      dateIssued: certificate.dateIssued,
      fileUrl: certificate.fileUrl,
      verifiedByOrganization:
        certificate.verifiedBy?.organizationName || certificate.verifiedBy?.name,
      verifiedAt: certificate.updatedAt,
    });
  })
);

export default router;
