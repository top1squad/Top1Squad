const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    game: {
      type: String,
      enum: ["BGMI", "Free Fire"],
      required: true,
    },

    gameUid: {
      type: String,
      required: true,
      trim: true,
    },

    mobileOtp: {
      type: String,
      required: true,
    },

    emailOtp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired OTP documents
otpSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

module.exports = mongoose.model("OTP", otpSchema);