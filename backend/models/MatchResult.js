const mongoose = require("mongoose");

const matchResultSchema = new mongoose.Schema(
  {
    // ==========================================
    // TOURNAMENT
    // ==========================================

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    // ==========================================
    // MATCH NUMBER
    // ==========================================

    matchNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==========================================
    // TEAM
    // ==========================================

    team: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // GAME
    // ==========================================

    game: {
      type: String,
      enum: ["BGMI", "Free Fire"],
      required: true,
    },

    // ==========================================
    // MATCH STATISTICS
    // ==========================================

    placement: {
      type: Number,
      required: true,
      min: 1,
    },

    kills: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    points: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Team won this match?
    win: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// PREVENT DUPLICATE TEAM RESULT
// ==========================================
//
// One team can have only one result
// for one match of one tournament.
//

matchResultSchema.index(
  {
    tournament: 1,
    matchNumber: 1,
    team: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "MatchResult",
  matchResultSchema
);