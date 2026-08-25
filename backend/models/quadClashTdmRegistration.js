const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    gameUid: {
      type: String,
      required: true,
      trim: true,
    },

    playerName: {
      type: String,
      required: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
  }
);

const squadClashTdmRegistrationSchema =
  new mongoose.Schema(
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
      // TEAM SLOT
      //
      // Only A or B.
      // ==========================================

      teamSlot: {
        type: String,
        enum: ["A", "B"],
        required: true,
      },

      // ==========================================
      // TEAM NAME
      // ==========================================

      teamName: {
        type: String,
        required: true,
        trim: true,
      },

      // ==========================================
      // TEAM LEADER
      // ==========================================

      leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      leaderGameUid: {
        type: String,
        required: true,
        trim: true,
      },

      // ==========================================
      // PLAYERS
      //
      // Exactly 4 players for TDM / Squad Clash.
      // ==========================================

      players: {
        type: [playerSchema],
        validate: {
          validator: function (players) {
            return (
              Array.isArray(players) &&
              players.length === 4
            );
          },
          message:
            "A team must contain exactly 4 players.",
        },
      },

      // ==========================================
      // PAYMENT
      // ==========================================

      utr: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Failed",
        ],
        default: "Pending",
      },

      // ==========================================
      // REGISTRATION STATUS
      // ==========================================

      registrationStatus: {
        type: String,
        enum: [
          "Pending",
          "Confirmed",
          "Cancelled",
        ],
        default: "Pending",
      },

      // ==========================================
      // ADMIN PAYMENT INFORMATION
      // ==========================================

      paymentVerifiedAt: {
        type: Date,
        default: null,
      },

      paymentVerifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      adminPaymentNote: {
        type: String,
        default: "",
        trim: true,
      },

      rejectionReason: {
        type: String,
        default: "",
        trim: true,
      },

      // ==========================================
      // REGISTRATION VERIFICATION
      // ==========================================

      verifiedAt: {
        type: Date,
        default: null,
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// ======================================================
// UNIQUE TEAM SLOT
//
// One tournament can have:
// A
// B
//
// But cannot have:
// A
// A
//
// ======================================================

squadClashTdmRegistrationSchema.index(
  {
    tournament: 1,
    teamSlot: 1,
  },
  {
    unique: true,
  }
);

// ======================================================
// ONE LEADER PER TOURNAMENT
// ======================================================

squadClashTdmRegistrationSchema.index(
  {
    tournament: 1,
    leader: 1,
  },
  {
    unique: true,
  }
);

// ======================================================
// UNIQUE UTR
// ======================================================

squadClashTdmRegistrationSchema.index(
  {
    utr: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "SquadClashTdmRegistration",
    squadClashTdmRegistrationSchema
  );