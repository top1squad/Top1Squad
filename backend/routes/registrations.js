const express = require("express");
const mongoose = require("mongoose");

const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");
const User = require("../models/User");

const registrationValidator =
  require("../validators/registrationValidator");

const asyncWrap =
  require("../utils/wrapAsync");

const router = express.Router();

// ======================================================
// ESCAPE REGEX
// ======================================================

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ======================================================
// NORMALIZE GAME
// ======================================================

function normalizeGame(game) {
  return String(game || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ======================================================
// GET UID FIELD FROM GAME
// ======================================================

function getUidField(game) {
  const normalized = normalizeGame(game);

  if (normalized === "bgmi") {
    return "bgmiUid";
  }

  if (
    normalized === "free fire" ||
    normalized === "freefire"
  ) {
    return "freeFireUid";
  }

  return null;
}

// ======================================================
// GET REQUIRED PLAYER COUNT
// ======================================================

function getRequiredPlayerCount(mode) {
  const normalized = String(mode || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  if (normalized === "solo") {
    return 1;
  }

  if (normalized === "duo") {
    return 2;
  }

  if (normalized === "squad") {
    return 4;
  }

  // TDM / Squad Clash have their own controller
  if (
    normalized === "tdm" ||
    normalized === "squad clash"
  ) {
    return null;
  }

  return null;
}

// ======================================================
// FIND USER BY GAME UID
// ======================================================

async function findUserByGameUid(game, uid) {
  const uidField = getUidField(game);

  if (!uidField) {
    return null;
  }

  const cleanUid = String(uid || "").trim();

  if (!cleanUid) {
    return null;
  }

  return User.findOne({
    [uidField]: {
      $regex: `^${escapeRegex(cleanUid)}$`,
      $options: "i",
    },
  }).select(
    "_id username fullName bgmiUid freeFireUid game gameUid"
  );
}

// ======================================================
// VALIDATE PLAYER GAME UID
//
// GET
// /api/registrations/validate-player-uid
//
// Example:
// /api/registrations/validate-player-uid?game=BGMI&uid=123456
// ======================================================

router.get(
  "/validate-player-uid",
  asyncWrap(async (req, res) => {
    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Please login.",
      });
    }

    // --------------------------------------------------
    // INPUT
    // --------------------------------------------------

    const game = String(
      req.query.game || ""
    ).trim();

    const uid = String(
      req.query.uid || ""
    ).trim();

    // --------------------------------------------------
    // UID REQUIRED
    // --------------------------------------------------

    if (!uid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Game ID is required.",
      });
    }

    // --------------------------------------------------
    // GAME FIELD
    // --------------------------------------------------

    const uidField = getUidField(game);

    if (!uidField) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Invalid game. Supported games are BGMI and Free Fire.",
      });
    }

    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const user = await findUserByGameUid(
      game,
      uid
    );

    // --------------------------------------------------
    // UID NOT FOUND
    // --------------------------------------------------

    if (!user) {
      return res.status(404).json({
        success: true,
        valid: false,
        message:
          `Invalid ${game} ID. This ID is not registered.`,
      });
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.json({
      success: true,
      valid: true,
      message: "Game ID is valid.",
      user: {
        id: String(user._id),
        _id: String(user._id),
        username: user.username || "",
        fullName: user.fullName || "",
        gameUid: uid,
        uid: uid,
      },
    });
  })
);

// ======================================================
// REGISTER TOURNAMENT
//
// POST /api/registrations
// ======================================================

router.post(
  "/",
  asyncWrap(async (req, res) => {
    // ==================================================
    // LOGIN
    // ==================================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Please login before registering.",
      });
    }

    // ==================================================
    // VALIDATE REQUEST
    // ==================================================

    const { error, value } =
      registrationValidator.validate(
        req.body,
        {
          stripUnknown: true,
          abortEarly: true,
        }
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.details[0].message,
      });
    }

    // ==================================================
    // TOURNAMENT ID
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        value.tournament
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid tournament ID.",
      });
    }

    // ==================================================
    // FIND TOURNAMENT
    // ==================================================

    const tournament =
      await Tournament.findById(
        value.tournament
      );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message:
          "Tournament not found.",
      });
    }

    // ==================================================
    // GAME
    // ==================================================

    const uidField =
      getUidField(tournament.game);

    if (!uidField) {
      return res.status(400).json({
        success: false,
        message:
          "Tournament game is invalid.",
      });
    }

    // ==================================================
    // MODE
    // ==================================================

    const requiredPlayers =
      getRequiredPlayerCount(
        tournament.mode
      );

    // ==================================================
    // NORMAL TOURNAMENT PLAYER COUNT
    // ==================================================

    if (requiredPlayers !== null) {
      const suppliedPlayers =
        Array.isArray(value.players)
          ? value.players
          : [];

      if (
        suppliedPlayers.length !==
        requiredPlayers
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${tournament.mode} tournament requires exactly ${requiredPlayers} player Game ID${requiredPlayers > 1 ? "s" : ""}.`,
          requiredPlayers,
          receivedPlayers:
            suppliedPlayers.length,
        });
      }
    }

    // ==================================================
    // TOURNAMENT STATUS
    // ==================================================

    if (
      tournament.status !==
      "Upcoming"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Registration is not available because tournament is ${tournament.status}.`,
      });
    }

    // ==================================================
    // TEAM LIMIT
    // ==================================================

    const registeredTeams =
      Number(
        tournament.registeredTeams || 0
      );

    const maxTeams =
      Number(
        tournament.maxTeams || 0
      );

    if (
      registeredTeams >=
      maxTeams
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tournament is full.",
      });
    }

    // ==================================================
    // NORMALIZE PLAYER IDS
    // ==================================================

    const playerIds =
      Array.isArray(value.players)
        ? value.players
            .map((id) =>
              String(id || "").trim()
            )
        : [];

    // ==================================================
    // NO EMPTY PLAYER UID
    // ==================================================

    if (
      playerIds.some(
        (id) => !id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Every player must provide a Game ID.",
      });
    }

    // ==================================================
    // PRIMARY UID
    // ==================================================

    const primaryGameUid =
      String(
        value.gameUid || ""
      ).trim();

    if (!primaryGameUid) {
      return res.status(400).json({
        success: false,
        message:
          "Primary Game UID is required.",
      });
    }

    // ==================================================
    // FIRST PLAYER MUST BE LEADER
    // ==================================================

    if (
      playerIds.length > 0 &&
      playerIds[0].toLowerCase() !==
        primaryGameUid.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Player 1 must be the registered user's Game UID.",
        playerIndex: 0,
      });
    }

    // ==================================================
    // DUPLICATE PLAYER IDS
    // ==================================================

    const normalizedIds =
      playerIds.map((id) =>
        id.toLowerCase()
      );

    const uniqueIds =
      new Set(normalizedIds);

    if (
      uniqueIds.size !==
      playerIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The same Game ID cannot be used more than once.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE REGISTRATION
    // ==================================================

    const existingRegistration =
      await Registration.findOne({
        user: req.user._id,
        tournament:
          tournament._id,
        registrationStatus: {
          $ne: "Cancelled",
        },
      });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message:
          "You have already registered for this tournament.",
        registration:
          existingRegistration,
      });
    }

    // ==================================================
    // CHECK PLAYER ALREADY USED IN THIS TOURNAMENT
    // ==================================================

    const playerAlreadyRegistered =
      await Registration.findOne({
        tournament:
          tournament._id,

        players: {
          $in: playerIds,
        },

        registrationStatus: {
          $ne: "Cancelled",
        },
      });

    if (playerAlreadyRegistered) {
      return res.status(409).json({
        success: false,
        message:
          "One or more Game IDs are already registered in another team for this tournament.",
      });
    }

    // ==================================================
    // VERIFY EVERY PLAYER UID
    // ==================================================

    const verifiedPlayers = [];

    for (
      let index = 0;
      index < playerIds.length;
      index++
    ) {
      const playerUid =
        playerIds[index];

      const existingUser =
        await findUserByGameUid(
          tournament.game,
          playerUid
        );

      if (!existingUser) {
        return res.status(400).json({
          success: false,
          valid: false,
          playerIndex: index,
          message:
            `Player ${index + 1} has an invalid ${tournament.game} ID. This ID is not registered.`,
        });
      }

      verifiedPlayers.push({
        uid: playerUid,
        userId:
          String(existingUser._id),
        username:
          existingUser.username || "",
        fullName:
          existingUser.fullName || "",
      });
    }

    // ==================================================
    // VERIFY LEADER UID BELONGS TO LOGGED-IN USER
    // ==================================================

    const loggedInUser =
      await User.findById(
        req.user._id
      ).select(
        "bgmiUid freeFireUid gameUid"
      );

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message:
          "Logged-in user was not found.",
      });
    }

    const leaderSavedUid =
      tournament.game === "BGMI"
        ? loggedInUser.bgmiUid
        : loggedInUser.freeFireUid;

    if (
      !leaderSavedUid ||
      String(leaderSavedUid)
        .trim()
        .toLowerCase() !==
        primaryGameUid
          .trim()
          .toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Player 1 must be your registered ${tournament.game} ID.`,
      });
    }

    // ==================================================
    // NORMALIZE UTR
    // ==================================================

    const normalizedUTR =
      value.utr
        ? String(value.utr)
            .trim()
            .toUpperCase()
        : "";

    // ==================================================
    // DUPLICATE UTR
    // ==================================================

    if (normalizedUTR) {
      const existingUtr =
        await Registration.findOne({
          utr: normalizedUTR,
        });

      if (existingUtr) {
        return res.status(409).json({
          success: false,
          message:
            "This UTR / Transaction ID has already been submitted.",
        });
      }
    }

    // ==================================================
    // CREATE REGISTRATION
    // ==================================================

    let registration;

    try {
      registration =
        await Registration.create({
          user:
            req.user._id,

          tournament:
            tournament._id,

          playerTeamName:
            value.playerTeamName,

          gameUid:
            primaryGameUid,

          players:
            playerIds,

          utr:
            normalizedUTR || null,

          paymentStatus:
            "Pending",

          registrationStatus:
            "Pending",

          paymentVerifiedBy:
            null,

          paymentVerifiedAt:
            null,

          adminPaymentNote:
            "",
        });
    } catch (registrationError) {
      // -----------------------------------------------
      // DUPLICATE INDEX
      // -----------------------------------------------

      if (
        registrationError?.code ===
        11000
      ) {
        if (
          registrationError?.keyPattern?.utr
        ) {
          return res.status(409).json({
            success: false,
            message:
              "This UTR / Transaction ID has already been submitted.",
          });
        }

        if (
          registrationError?.keyPattern?.user &&
          registrationError?.keyPattern?.tournament
        ) {
          return res.status(409).json({
            success: false,
            message:
              "You have already registered for this tournament.",
          });
        }
      }

      throw registrationError;
    }

    // ==================================================
    // INCREASE REGISTERED TEAMS
    // ==================================================

    tournament.registeredTeams =
      registeredTeams + 1;

    await tournament.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Registration submitted successfully. Payment is pending admin verification.",

      registration,

      verifiedPlayers,
    });
  })
);

// ======================================================
// GET MY REGISTRATIONS
// ======================================================

router.get(
  "/my",
  asyncWrap(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Please login.",
      });
    }

    const registrations =
      await Registration.find({
        user: req.user._id,
      })
        .populate("tournament")
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      registrations,
    });
  })
);

// ======================================================
// GET SINGLE REGISTRATION
// ======================================================

router.get(
  "/:id",
  asyncWrap(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Please login.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration ID.",
      });
    }

    const registration =
      await Registration.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate(
        "tournament"
      );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message:
          "Registration not found.",
      });
    }

    return res.json({
      success: true,
      registration,
    });
  })
);

// ======================================================
// CANCEL REGISTRATION
// ======================================================

router.patch(
  "/:id/cancel",
  asyncWrap(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Please login.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration ID.",
      });
    }

    const registration =
      await Registration.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message:
          "Registration not found.",
      });
    }

    if (
      registration.registrationStatus ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration is already cancelled.",
      });
    }

    if (
      registration.registrationStatus ===
      "Confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Confirmed registration cannot be cancelled from here.",
      });
    }

    registration.registrationStatus =
      "Cancelled";

    registration.paymentStatus =
      "Failed";

    await registration.save();

    await Tournament.findByIdAndUpdate(
      registration.tournament,
      {
        $inc: {
          registeredTeams: -1,
        },
      }
    );

    return res.json({
      success: true,
      message:
        "Registration cancelled successfully.",
      registration,
    });
  })
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;