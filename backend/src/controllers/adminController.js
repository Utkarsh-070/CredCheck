import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import VerifierRequest from '../models/VerifierRequest.js';
import Certificate from '../models/Certificate.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users });
});

export const getVerifierRequests = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  const requests = await VerifierRequest.find({ status }).sort({ createdAt: 1 });
  res.json({ requests });
});

export const decideVerifierRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'approved' or 'rejected'");
  }

  const request = await VerifierRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Verifier request not found');
  }

  request.status = decision;
  await request.save();

  if (decision === 'approved') {
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      existingUser.role = 'verifier';
      existingUser.verified = true;
      existingUser.organizationName = request.organizationName;
      await existingUser.save();
    }

    const { subject, html } = emailTemplates.verifierRequestApproved(request.organizationName);
    await sendEmail({ to: request.email, subject, html });
  }

  res.json({ request });
});

export const removeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

export const getAllCertificates = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const certificates = await Certificate.find(filter)
    .populate('studentId', 'name email')
    .sort({ createdAt: -1 });
  res.json({ certificates });
});

export const getAdminHistory = asyncHandler(async (req, res) => {
  const requests = await VerifierRequest.find({
    status: { $in: ['approved', 'rejected'] },
  }).sort({ updatedAt: -1 });
  res.json({ requests });
});
