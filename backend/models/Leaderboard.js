const mongoose = require("mongoose");


// ======================================================
// WINNER SCHEMA
// ======================================================

const winnerSchema = new mongoose.Schema(
  {
    // Registered team/registration
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },

    // User who created the registration / team leader
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Saved for easy display
    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    // Leader's game UID
    gameUid: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);


// ======================================================
// LEADERBOARD SCHEMA
// ======================================================

const leaderboardSchema = new mongoose.Schema(
  {
    // ==================================================
    // TOURNAMENT
    // ==================================================

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      unique: true,
    },


    // ==================================================
    // 1ST PLACE
    // ==================================================

    first: {
      type: winnerSchema,
      default: null,
    },


    // ==================================================
    // 2ND PLACE
    // ==================================================

    second: {
      type: winnerSchema,
      default: null,
    },


    // ==================================================
    // 3RD PLACE
    // ==================================================

    third: {
      type: winnerSchema,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.model(
    "Leaderboard",
    leaderboardSchema
  );