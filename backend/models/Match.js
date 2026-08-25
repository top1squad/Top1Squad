const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    matchName: {
      type: String,
      required: true,
      trim: true,
    },

    game: {
      type: String,
      required: true,
      enum: ["BGMI", "Free Fire"],
    },

    map: {
      type: String,
      required: true,
      enum: [
        "Erangel",
        "Miramar",
        "Sanhok",
        "Vikendi",
        "Bermuda",
      ],
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    maxTeams: {
      type: Number,
      required: true,
      min: 1,
    },

    roomId: {
      type: String,
      trim: true,
    },

    roomPassword: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "live",
        "completed",
        "cancelled",
      ],
      default: "upcoming",
    },

    roomVisible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model(
  "Match",
  matchSchema
);

module.exports = Match;