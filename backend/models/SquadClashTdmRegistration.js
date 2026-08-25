const mongoose = require("mongoose");

// ======================================================
// PLAYER SCHEMA
// ======================================================

const playerSchema = new mongoose.Schema(
  {
    // ==================================================
    // PLAYER SLOT
    // ==================================================

    slot: {
      type: Number,
      required: [true, "Player slot is required."],
      min: 1,
      max: 4,
    },

    // ==================================================
    // USER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Player user is required."],
    },

    // ==================================================
    // GAME UID
    // ==================================================

    uid: {
      type: String,
      required: [true, "Player Game ID is required."],
      trim: true,
      maxlength: 100,
    },

    // ==================================================
    // PLAYER NAME
    // ==================================================

    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ==================================================
    // UID VERIFIED
    // ==================================================

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// REGISTRATION SCHEMA
// ======================================================

const registrationSchema = new mongoose.Schema(
  {
    // ==================================================
    // TOURNAMENT
    // ==================================================

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SquadClashTdm",
      required: [true, "Tournament is required."],
      index: true,
    },

    // ==================================================
    // TEAM LEADER
    // ==================================================

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team leader is required."],
      index: true,
    },

    // ==================================================
    // TEAM NAME
    // ==================================================

    teamName: {
      type: String,
      required: [true, "Team name is required."],
      trim: true,
      minlength: [2, "Team name must be at least 2 characters."],
      maxlength: [50, "Team name cannot exceed 50 characters."],
    },

    // ==================================================
    // TEAM SLOT
    // ==================================================

    teamSlot: {
      type: String,
      enum: {
        values: ["A", "B"],
        message: "Team slot must be A or B.",
      },
      required: [true, "Team slot is required."],
      uppercase: true,
      trim: true,
      index: true,
    },

    // ==================================================
    // FOUR PLAYERS
    // ==================================================

    players: {
      type: [playerSchema],
      required: true,

      validate: {
        validator: function (value) {
          if (!Array.isArray(value)) {
            return false;
          }

          if (value.length !== 4) {
            return false;
          }

          const slots = value.map(
            (player) => Number(player.slot)
          );

          const uniqueSlots = new Set(slots);

          return (
            uniqueSlots.size === 4 &&
            slots.every(
              (slot) =>
                Number.isInteger(slot) &&
                slot >= 1 &&
                slot <= 4
            )
          );
        },

        message:
          "Exactly 4 players with unique slots 1 to 4 are required.",
      },
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
    // UTR
    // ==================================================

    utr: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    paymentStatus: {
      type: String,
      enum: {
        values: [
          "Pending",
          "Verified",
          "Rejected",
        ],
        message:
          "Invalid payment status.",
      },
      default: "Pending",
    },

    // ==================================================
    // REGISTRATION STATUS
    // ==================================================

    registrationStatus: {
      type: String,
      enum: {
        values: [
          "Pending",
          "Confirmed",
          "Cancelled",
          "Rejected",
        ],
        message:
          "Invalid registration status.",
      },
      default: "Pending",
    },

    // ==================================================
    // ADMIN NOTE
    // ==================================================

    adminNote: {
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
// ONE ACTIVE TEAM PER LEADER PER TOURNAMENT
//
// Cancelled / Rejected registrations do not block
// a new registration.
// ======================================================

registrationSchema.index(
  {
    tournament: 1,
    leader: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      registrationStatus: {
        $nin: [
          "Cancelled",
          "Rejected",
        ],
      },
    },
  }
);

// ======================================================
// ONE ACTIVE TEAM PER SLOT
//
// Team A = one active registration
// Team B = one active registration
//
// Cancelled / Rejected registrations free the slot.
// ======================================================

registrationSchema.index(
  {
    tournament: 1,
    teamSlot: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      registrationStatus: {
        $nin: [
          "Cancelled",
          "Rejected",
        ],
      },
    },
  }
);

// ======================================================
// INDEX
// ======================================================

registrationSchema.index({
  createdAt: -1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.models.SquadClashTdmRegistration ||
  mongoose.model(
    "SquadClashTdmRegistration",
    registrationSchema
  );