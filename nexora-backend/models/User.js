const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'admin'], required: true },
  district: { type: String, default: 'India' },

  // Email verified via OTP before account is usable
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },

  // ── Identity (never store full Aadhaar — last 4 digits only) ──
  aadhaarLast4: { type: String },
  panNumber: { type: String },

  // ── Farmer profile fields (optional) ──
  village: { type: String },
  taluka: { type: String },
  state: { type: String },
  landRecord: { type: String },
  primaryCrop: { type: String },
  landAreaAcres: { type: Number },
  ownershipNo: { type: String },

  // ── Buyer profile fields (optional) ──
  companyName: { type: String },
  gstNumber: { type: String },
  industryType: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
