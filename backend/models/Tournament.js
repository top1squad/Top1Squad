const mongoose = require("mongoose");

// ======================================================
// TOURNAMENT SCHEMA
// ======================================================

const tournamentSchema = new mongoose.Schema(
  {
    // ====================================================
    // BASIC INFORMATION
    // ====================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    // ====================================================
    // GAME
    // ====================================================

    game: {
      type: String,
      required: true,
      enum: ["BGMI", "Free Fire"],
      trim: true,
    },

    // ====================================================
    // TOURNAMENT MODE
    // ====================================================

    mode: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Solo",
        "Duo",
        "Squad",
        "TDM",
        "Squad Clash",
      ],
    },

    // ====================================================
    // PRIZE
    // ====================================================

    prize: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ====================================================
    // ENTRY FEE
    // ====================================================

    entryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ====================================================
    // MAX TEAMS
    // ====================================================

    maxTeams: {
      type: Number,
      required: true,
      min: 1,
      default: 10,
    },

    // ====================================================
    // REGISTERED TEAMS
    // ====================================================

    registeredTeams: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ====================================================
    // DATE
    // ====================================================

    date: {
      type: String,
      required: true,
      trim: true,
    },

    // ====================================================
    // TIME
    // ====================================================

    time: {
      type: String,
      required: true,
      trim: true,
    },

    // ====================================================
    // MAP
    // ====================================================

    map: {
      type: String,
      required: true,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // ====================================================
    // ROOM ID
    // ====================================================

    roomId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ====================================================
    // ROOM PASSWORD
    // ====================================================

    roomPassword: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ====================================================
    // PAYMENT QR
    // ====================================================

    paymentQr: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================================
    // PAYMENT UPI ID
    // ====================================================

    paymentUpiId: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================================
    // STATUS
    // ====================================================

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

    // ====================================================
    // DESCRIPTION
    // ====================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // ====================================================
    // RULES
    // ====================================================

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
// NORMALIZE / VALIDATE TOURNAMENT
// ======================================================

tournamentSchema.pre(
  "validate",
  function () {
    const normalizedMode = String(
      this.mode || ""
    )
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, " ");

    const isSpecialMode =
      normalizedMode === "tdm" ||
      normalizedMode === "squad clash";

    // ==================================================
    // TDM / SQUAD CLASH
    // ==================================================

    if (isSpecialMode) {
      this.maxTeams = 2;
    }

    // ==================================================
    // REGISTERED TEAMS
    // ==================================================

    const registeredTeams = Number(
      this.registeredTeams
    );

    const maxTeams = Number(
      this.maxTeams
    );

    // ==================================================
    // MUST BE INTEGER
    // ==================================================

    if (
      !Number.isInteger(
        registeredTeams
      )
    ) {
      this.invalidate(
        "registeredTeams",
        "Registered teams must be a whole number."
      );

      return;
    }

    // ==================================================
    // CANNOT BE NEGATIVE
    // ==================================================

    if (registeredTeams < 0) {
      this.invalidate(
        "registeredTeams",
        "Registered teams cannot be negative."
      );

      return;
    }

    // ==================================================
    // MAX TEAMS VALIDATION
    // ==================================================

    if (
      !Number.isInteger(maxTeams) ||
      maxTeams < 1
    ) {
      this.invalidate(
        "maxTeams",
        "Maximum teams must be a positive whole number."
      );

      return;
    }

    // ==================================================
    // SPECIAL MODE LIMIT
    // ==================================================

    if (
      isSpecialMode &&
      registeredTeams > 2
    ) {
      this.invalidate(
        "registeredTeams",
        "TDM and Squad Clash can have maximum 2 registered teams."
      );

      return;
    }

    // ==================================================
    // NORMAL MODE LIMIT
    // ==================================================

    if (
      !isSpecialMode &&
      registeredTeams > maxTeams
    ) {
      this.invalidate(
        "registeredTeams",
        "Registered teams cannot be greater than maximum teams."
      );

      return;
    }
  }
);

// ======================================================
// INDEXES
// ======================================================

tournamentSchema.index({
  game: 1,
  mode: 1,
});

tournamentSchema.index({
  status: 1,
  date: 1,
});

tournamentSchema.index({
  createdAt: -1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.models.Tournament ||
  mongoose.model(
    "Tournament",
    tournamentSchema
  );