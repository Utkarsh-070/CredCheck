import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firebaseUid: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['student', 'verifier', 'admin'],
      default: 'student',
    },
    college: { type: String, trim: true },           // student only
    organizationName: { type: String, trim: true },  // verifier only
    verified: { type: Boolean, default: false },      // verifier org email/identity verified
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
