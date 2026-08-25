const mongoose = require("mongoose");

const teamMatchSchema = new mongoose.Schema(
  {
    // ======================================================
    // MATCH NAME
    // ======================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    // ======================================================
    // MATCH TYPE
    //
    // ONLY:
    // TDM
    // Squad Clash
    // ======================================================

    matchType: {
      type: String,
      enum: ["TDM", "Squad Clash"],
      required: true,
      trim: true,
    },

    // ======================================================
    // GAME
    // ======================================================

    game: {
      type: String,
      enum: ["BGMI", "Free Fire"],
      required: true,
    },

    // ======================================================
    // PRIZE
    // ======================================================

    prize: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================================
    // ENTRY FEE
    // ======================================================

    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================================
    // MAX TEAMS
    //
    // FIXED TO 2.
    //
    // This is intentionally NOT accepted from frontend.
    // ======================================================

    maxTeams: {
      type: Number,
      default: 2,
      immutable: true,
      min: 2,
      max: 2,
    },

    // ======================================================
    // REGISTERED TEAMS
    // ======================================================

    registeredTeams: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },

    // ======================================================
    // DATE
    // ======================================================

    date: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // TIME
    // ======================================================

    time: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // MODE
    //
    // Automatically kept consistent with matchType.
    // ======================================================

    mode: {
      type: String,
      enum: ["TDM", "Squad Clash"],
      required: true,
    },

    // ======================================================
    // MAP
    // ======================================================

    map: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    // ======================================================
    // ROOM ID
    // ======================================================

    roomId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ======================================================
    // ROOM PASSWORD
    // ======================================================

    roomPassword: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ======================================================
    // STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "Upcoming",
        "Live",
        "Completed",
        "Cancelled",
      ],
      default: "Upcoming",
    },

    // ======================================================
    // DESCRIPTION
    // ======================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // ======================================================
    // RULES
    // ======================================================

    rules: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// VALIDATE REGISTERED TEAMS
// ======================================================

teamMatchSchema.path("registeredTeams").validate(
  function (value) {
    return value >= 0 && value <= 2;
  },
  "Registered teams must be between 0 and 2."
);

// ======================================================
// MODE MUST MATCH MATCH TYPE
// ======================================================

teamMatchSchema.pre("validate", function (next) {
  if (this.matchType) {
    this.mode = this.matchType;
  }

  if (this.maxTeams !== 2) {
    this.maxTeams = 2;
  }

  next();
});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "TeamMatch",
  teamMatchSchema,
  "teammatches"
);