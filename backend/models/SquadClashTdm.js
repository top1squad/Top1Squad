const mongoose = require("mongoose");

// ======================================================
// SQUAD CLASH / TDM TOURNAMENT SCHEMA
// ======================================================

const squadClashTdmSchema = new mongoose.Schema(
  {
    // ==================================================
    // TOURNAMENT NAME
    // ==================================================

    name: {
      type: String,
      required: [true, "Tournament name is required."],
      trim: true,
      minlength: [2, "Tournament name must be at least 2 characters."],
      maxlength: [150, "Tournament name cannot exceed 150 characters."],
    },

    // ==================================================
    // MATCH TYPE
    // ==================================================

    type: {
      type: String,
      enum: {
        values: ["TDM", "Squad Clash"],
        message: "Type must be TDM or Squad Clash.",
      },
      required: [true, "Tournament type is required."],
      default: "TDM",
      trim: true,
    },

    // ==================================================
    // GAME
    // ==================================================

    game: {
      type: String,
      enum: {
        values: ["BGMI", "Free Fire"],
        message: "Game must be BGMI or Free Fire.",
      },
      required: [true, "Game is required."],
      default: "BGMI",
      trim: true,
    },

    // ==================================================
    // PRIZE
    // ==================================================

    prize: {
      type: Number,
      min: [0, "Prize cannot be negative."],
      default: 0,
    },

    // ==================================================
    // ENTRY FEE
    // ==================================================

    entryFee: {
      type: Number,
      min: [0, "Entry fee cannot be negative."],
      default: 0,
    },

    // ==================================================
    // MAX TEAMS
    //
    // Squad Clash / TDM supports exactly 2 teams:
    // Team A + Team B
    // ==================================================

    maxTeams: {
      type: Number,
      default: 2,
      min: 2,
      max: 2,
      immutable: true,
    },

    // ==================================================
    // REGISTERED TEAMS
    //
    // This value is maintained by controller logic.
    // The real source of truth remains registrations.
    // ==================================================

    registeredTeams: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },

    // ==================================================
    // MATCH DATE
    // ==================================================

    date: {
      type: Date,
      required: [true, "Tournament date is required."],
    },

    // ==================================================
    // MATCH TIME
    // ==================================================

    time: {
      type: String,
      required: [true, "Tournament time is required."],
      trim: true,
      maxlength: 50,
    },

    // ==================================================
    // MAP
    // ==================================================

    map: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ==================================================
    // ROOM ID
    // ==================================================

    roomId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ==================================================
    // ROOM PASSWORD
    // ==================================================

    roomPassword: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ==================================================
    // PAYMENT QR
    // ==================================================

    paymentQr: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // PAYMENT UPI ID
    // ==================================================

    paymentUpiId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ==================================================
    // DESCRIPTION
    // ==================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: {
        values: [
          "Upcoming",
          "Live",
          "Completed",
          "Cancelled",
        ],
        message:
          "Status must be Upcoming, Live, Completed or Cancelled.",
      },
      default: "Upcoming",
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEXES
// ======================================================

squadClashTdmSchema.index({
  createdAt: -1,
});

squadClashTdmSchema.index({
  game: 1,
  type: 1,
});

squadClashTdmSchema.index({
  status: 1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.models.SquadClashTdm ||
  mongoose.model(
    "SquadClashTdm",
    squadClashTdmSchema
  );