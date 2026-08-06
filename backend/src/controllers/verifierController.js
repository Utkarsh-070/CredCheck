import { v4 as uuidv4 } from 'uuid';
import asyncHandler from '../utils/asyncHandler.js';
import Certificate from '../models/Certificate.js';
import VerifierRequest from '../models/VerifierRequest.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';
import { generateQRCode } from '../utils/generateQRCode.js';

export const getPendingCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    verifierEmail: req.user.email,
    status: 'pending',
  })
    .populate('studentId', 'name email college')
    .sort({ createdAt: 1 });

  res.json({ certificates });
});

export const decideCertificate = asyncHandler(async (req, res) => {
  const { decision, comments } = req.body;

  if (!['verified', 'rejected'].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'verified' or 'rejected'");
  }

  const certificate = await Certificate.findById(req.params.id).populate('studentId');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  if (certificate.verifierEmail !== req.user.email) {
    res.status(403);
    throw new Error('This certificate was not addressed to you');
  }
  if (certificate.status !== 'pending') {
    res.status(400);
    throw new Error('This certificate has already been decided');
  }

  certificate.status = decision;
  certificate.comments = comments || '';
  certificate.verifiedBy = req.user._id;

  if (decision === 'verified') {
    certificate.publicLinkId = uuidv4();
    certificate.qrCodeUrl = await generateQRCode(certificate.publicLinkId);
  }

  await certificate.save();

  const { subject, html } = emailTemplates.certificateDecision(
    certificate.title,
    decision,
    comments
  );
  await sendEmail({ to: certificate.studentId.email, subject, html });

  res.json({ certificate });
});

export const getVerifierHistory = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    verifierEmail: req.user.email,
    status: { $in: ['verified', 'rejected'] },
  })
    .populate('studentId', 'name email college')
    .sort({ updatedAt: -1 });

  res.json({ certificates });
});

export const applyAsVerifier = asyncHandler(async (req, res) => {
  const { organizationName, email } = req.body;

  if (!organizationName || !email) {
    res.status(400);
    throw new Error('organizationName and email are required');
  }

  const existing = await VerifierRequest.findOne({
    email: email.toLowerCase(),
    status: 'pending',
  });
  if (existing) {
    res.status(400);
    throw new Error('A pending request already exists for this email');
  }

  const request = await VerifierRequest.create({
    organizationName,
    email: email.toLowerCase(),
  });

  res.status(201).json({ request });
});
