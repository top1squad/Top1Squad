const mongoose = require("mongoose");

// ======================================================
// REGISTRATION SCHEMA
// ======================================================

const registrationSchema = new mongoose.Schema(
  {
    // ======================================================
    // LOGGED-IN USER / LEADER
    // ======================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // TOURNAMENT
    // ======================================================

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    // ======================================================
    // PLAYER / TEAM NAME
    // ======================================================

    playerTeamName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // ======================================================
    // PRIMARY GAME UID
    // ======================================================

    gameUid: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // ALL PLAYER GAME IDS
    // ======================================================

    players: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (players) {
          return (
            Array.isArray(players) &&
            players.length >= 1 &&
            players.length <= 4
          );
        },

        message:
          "Registration must contain between 1 and 4 players.",
      },
    },

    // ======================================================
    // PAYMENT UTR
    // ======================================================

    utr: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    // ======================================================
    // PAYMENT STATUS
    // ======================================================

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    // ======================================================
    // REGISTRATION STATUS
    // ======================================================

    registrationStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
      ],
      default: "Pending",
    },

    // ======================================================
    // PAYMENT VERIFIED AT
    // ======================================================

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    // ======================================================
    // ADMIN WHO VERIFIED PAYMENT
    // ======================================================

    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // ADMIN PAYMENT NOTE
    // ======================================================

    adminPaymentNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },

  {
    timestamps: true,
  }
);

// ======================================================
// ONE USER / LEADER CANNOT REGISTER TWICE
// FOR SAME TOURNAMENT
// ======================================================

registrationSchema.index(
  {
    user: 1,
    tournament: 1,
  },
  {
    unique: true,
  }
);

// ======================================================
// UNIQUE UTR
// ======================================================
//
// Sparse index means documents with null/missing UTR
// do not conflict with each other.
//
// ======================================================

registrationSchema.index(
  {
    utr: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

// ======================================================
// TOURNAMENT LOOKUP INDEX
// ======================================================

registrationSchema.index({
  tournament: 1,
  registrationStatus: 1,
});

// ======================================================
// USER LOOKUP INDEX
// ======================================================

registrationSchema.index({
  user: 1,
  createdAt: -1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.models.Registration ||
  mongoose.model(
    "Registration",
    registrationSchema
  );