import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import VerifierRequest from '../models/VerifierRequest.js';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login
// Body: { idToken, college? }
// Frontend does Google Sign-In via Firebase, gets a Firebase ID token, and
// sends it here. We verify it server-side, find-or-create the User, then
// issue our OWN JWT — that JWT (not the Firebase token) is what every other
// route checks. This keeps all our auth middleware simple and provider-agnostic.
export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { idToken, college } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('idToken is required');
  }

  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name } = decoded;

  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // Role is NEVER trusted from client input. Instead: if an admin already
    // approved this email as a verifier org, promote them on first login.
    const approvedRequest = await VerifierRequest.findOne({ email, status: 'approved' });

    user = await User.create({
      name: name || email.split('@')[0],
      email,
      firebaseUid: uid,
      role: approvedRequest ? 'verifier' : 'student',
      organizationName: approvedRequest ? approvedRequest.organizationName : undefined,
      verified: Boolean(approvedRequest),
      college,
    });
  }

  const token = generateToken(user._id);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      organizationName: user.organizationName,
      verified: user.verified,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, college, organizationName } = req.body;

  if (name !== undefined) req.user.name = name;
  if (college !== undefined) req.user.college = college;
  if (organizationName !== undefined) req.user.organizationName = organizationName;

  await req.user.save();
  res.json({ user: req.user });
});
