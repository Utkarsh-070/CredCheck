import mongoose from 'mongoose';

const verifierRequestSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const VerifierRequest = mongoose.model('VerifierRequest', verifierRequestSchema);

export default VerifierRequest;
