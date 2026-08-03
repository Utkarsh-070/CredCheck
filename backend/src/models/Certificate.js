import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dateIssued: { type: Date },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String }, // cloudinary public_id, useful if you ever delete the file
    verifierEmail: { type: String, required: true, lowercase: true, trim: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    comments: { type: String, trim: true },
    publicLinkId: { type: String, unique: true, sparse: true }, // set only once verified
    qrCodeUrl: { type: String },
  },
  { timestamps: true }
);

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
