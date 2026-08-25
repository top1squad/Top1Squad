const mongoose = require("mongoose");

const passportLocalMongooseModule =
  require("passport-local-mongoose");

const passportLocalMongoose =
  passportLocalMongooseModule.default ||
  passportLocalMongooseModule;

// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC INFORMATION
    // ==================================================

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // ==================================================
    // UPI ID
    // ==================================================

    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
        "Please enter a valid UPI ID",
      ],
    },

    // ==================================================
    // GAME
    // ==================================================

    game: {
      type: String,
      enum: ["BGMI", "Free Fire"],
      required: true,
    },

    // ==================================================
    // PRIMARY GAME UID
    // ==================================================

    gameUid: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // BGMI UID
    // ==================================================

    bgmiUid: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // FREE FIRE UID
    // ==================================================

    freeFireUid: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // ADDITIONAL REGISTERED GAME IDS
    // ==================================================

    registeredGameIds: [
      {
        game: {
          type: String,
          enum: ["BGMI", "Free Fire"],
          required: true,
        },

        uid: {
          type: String,
          required: true,
          trim: true,
        },

        tournament: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SquadClashTdm",
          default: null,
        },

        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==================================================
    // ROLE
    // ==================================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },

  {
    timestamps: true,
  }
);

// ======================================================
// PASSPORT LOCAL MONGOOSE
// ======================================================

userSchema.plugin(passportLocalMongoose, {
  usernameField: "username",
});

// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);