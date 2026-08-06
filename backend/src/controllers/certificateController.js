import asyncHandler from '../utils/asyncHandler.js';
import Certificate from '../models/Certificate.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const uploadCertificate = asyncHandler(async (req, res) => {
  const { title, organization, description, dateIssued, verifierEmail } = req.body;

  if (!title || !organization || !verifierEmail) {
    res.status(400);
    throw new Error('title, organization, and verifierEmail are required');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('A certificate file (PDF/JPG/PNG) is required');
  }

  const certificate = await Certificate.create({
    studentId: req.user._id,
    title,
    organization,
    description,
    dateIssued,
    fileUrl: req.file.path,
    filePublicId: req.file.filename,
    verifierEmail: verifierEmail.toLowerCase(),
    status: 'pending',
  });

  const { subject, html } = emailTemplates.newCertificateSubmitted(req.user.name, title);
  await sendEmail({ to: verifierEmail, subject, html });

  res.status(201).json({ certificate });
});

export const getMyCertificates = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { studentId: req.user._id };
  if (status) filter.status = status;

  const certificates = await Certificate.find(filter).sort({ createdAt: -1 });
  res.json({ certificates });
});

export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  if (String(certificate.studentId) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this certificate');
  }

  res.json({ certificate });
});
