const mongoose = require("mongoose");

const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");

const registrationValidator = require(
  "../validators/registrationValidator"
);

// ======================================================
// HELPERS
// ======================================================

function normalizeMode(mode) {
  return String(mode || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

function getRequiredPlayers(mode) {
  const normalized = normalizeMode(mode);

  if (normalized === "solo") {
    return 1;
  }

  if (normalized === "duo") {
    return 2;
  }

  if (
    normalized === "squad" ||
    normalized === "tdm" ||
    normalized === "squad clash"
  ) {
    return 4;
  }

  return null;
}

function isTdmOrSquadClash(mode) {
  const normalized = normalizeMode(mode);

  return (
    normalized === "tdm" ||
    normalized === "squad clash"
  );
}

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

// ======================================================
// CREATE REGISTRATION
// POST /api/registrations
// ======================================================

const createRegistration = async (
  req,
  res,
  next
) => {
  try {
    // ==================================================
    // LOGIN
    // ==================================================

    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message:
          "Please login before registering.",
      });
    }

    // ==================================================
    // VALIDATE REQUEST
    // ==================================================

    const {
      error,
      value,
    } = registrationValidator.validate(
      req.body,
      {
        abortEarly: true,
        stripUnknown: true,
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
    // VALIDATE TOURNAMENT ID
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
    // TOURNAMENT STATUS
    // ==================================================

    if (
      tournament.status ===
        "Completed" ||
      tournament.status ===
        "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration is closed for this tournament.",
      });
    }

    // ==================================================
    // REQUIRED PLAYER COUNT
    // ==================================================

    const requiredPlayers =
      getRequiredPlayers(
        tournament.mode
      );

    if (!requiredPlayers) {
      return res.status(400).json({
        success: false,
        message:
          `Unsupported tournament mode: ${tournament.mode}`,
      });
    }

    // ==================================================
    // PLAYER IDS
    // ==================================================

    const players = Array.isArray(
      value.players
    )
      ? value.players
          .map((player) =>
            clean(player)
          )
          .filter(Boolean)
      : [];

    if (
      players.length !==
      requiredPlayers
    ) {
      return res.status(400).json({
        success: false,
        message:
          `${tournament.mode} tournament requires exactly ${requiredPlayers} game ID${
            requiredPlayers > 1
              ? "s"
              : ""
          }.`,
      });
    }

    // ==================================================
    // DUPLICATE PLAYER IDS
    // ==================================================

    const uniquePlayers =
      new Set(
        players.map((player) =>
          player.toLowerCase()
        )
      );

    if (
      uniquePlayers.size !==
      players.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The same Game ID cannot be used more than once.",
      });
    }

    // ==================================================
    // PRIMARY GAME UID
    // ==================================================

    const primaryGameUid =
      clean(value.gameUid);

    if (!primaryGameUid) {
      return res.status(400).json({
        success: false,
        message:
          "Primary Game UID is required.",
      });
    }

    // ==================================================
    // FIRST PLAYER MUST MATCH PRIMARY UID
    // ==================================================

    if (
      players[0] !==
      primaryGameUid
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The first player ID must match the registered user's Game UID.",
      });
    }

    // ==================================================
    // TOURNAMENT CAPACITY
    // ==================================================

    if (
      Number(
        tournament.registeredTeams
      ) >=
      Number(
        tournament.maxTeams
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tournament is full.",
      });
    }

    // ==================================================
    // GET LOGGED-IN USER GAME UID
    // ==================================================

    let userGameUid = "";

    if (
      tournament.game ===
      "BGMI"
    ) {
      userGameUid =
        req.user.bgmiUid || "";
    }

    if (
      tournament.game ===
      "Free Fire"
    ) {
      userGameUid =
        req.user.freeFireUid || "";
    }

    userGameUid =
      clean(userGameUid);

    if (!userGameUid) {
      return res.status(400).json({
        success: false,
        message:
          `Please add your ${tournament.game} UID in Settings before registering.`,
      });
    }

    // ==================================================
    // VERIFY PRIMARY UID
    // ==================================================

    if (
      userGameUid !==
      primaryGameUid
    ) {
      return res.status(400).json({
        success: false,
        message:
          `The first ID must match your saved ${tournament.game} UID.`,
      });
    }

    // ==================================================
    // EXISTING REGISTRATION
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
          "You are already registered for this tournament.",
        registration:
          existingRegistration,
      });
    }

    // ==================================================
    // CHECK PLAYER DUPLICATES IN SAME TOURNAMENT
    // ==================================================
    //
    // This is especially important for:
    //
    // TDM
    // Squad Clash
    //
    // because multiple teams can be registered.
    //
    // ==================================================

    const playerAlreadyRegistered =
      await Registration.findOne({
        tournament:
          tournament._id,

        players: {
          $in: players,
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
    // CREATE REGISTRATION
    // ==================================================

    const registration =
      await Registration.create({
        user: req.user._id,

        tournament:
          tournament._id,

        playerTeamName:
          clean(
            value.playerTeamName
          ),

        gameUid:
          primaryGameUid,

        players,

        paymentStatus:
          "Pending",

        registrationStatus:
          "Confirmed",
      });

    // ==================================================
    // UPDATE TOURNAMENT COUNT
    // ==================================================

    tournament.registeredTeams =
      Number(
        tournament.registeredTeams || 0
      ) + 1;

    await tournament.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        isTdmOrSquadClash(
          tournament.mode
        )
          ? `${tournament.mode} registration successful.`
          : "Tournament registration successful.",

      registration,
    });
  } catch (error) {
    console.error(
      "CREATE REGISTRATION ERROR:",
      error
    );

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You are already registered for this tournament.",
      });
    }

    next(error);
  }
};

// ======================================================
// GET MY TOURNAMENTS
// GET /api/registrations/my
// ======================================================

const getMyRegistrations =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Please login first.",
        });
      }

      const registrations =
        await Registration.find({
          user:
            req.user._id,
        })
          .populate(
            "tournament"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          registrations.length,

        registrations,
      });
    } catch (error) {
      console.error(
        "GET MY REGISTRATIONS ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// GET SINGLE REGISTRATION
// GET /api/registrations/:id
// ======================================================

const getRegistrationById =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Please login first.",
        });
      }

      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
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
          _id: id,

          user:
            req.user._id,
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

      return res.status(200).json({
        success: true,

        registration,
      });
    } catch (error) {
      console.error(
        "GET REGISTRATION ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// CANCEL REGISTRATION
// PATCH /api/registrations/:id/cancel
// ======================================================

const cancelRegistration =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Please login first.",
        });
      }

      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
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
          _id: id,

          user:
            req.user._id,

          registrationStatus: {
            $ne: "Cancelled",
          },
        });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      // ==================================================
      // CANCEL
      // ==================================================

      registration.registrationStatus =
        "Cancelled";

      await registration.save();

      // ==================================================
      // DECREASE TOURNAMENT COUNT
      // ==================================================

      const tournament =
        await Tournament.findById(
          registration.tournament
        );

      if (
        tournament &&
        Number(
          tournament.registeredTeams
        ) > 0
      ) {
        tournament.registeredTeams =
          Number(
            tournament.registeredTeams
          ) - 1;

        await tournament.save();
      }

      return res.status(200).json({
        success: true,

        message:
          "Registration cancelled successfully.",

        registration,
      });
    } catch (error) {
      console.error(
        "CANCEL REGISTRATION ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// GET TOURNAMENT REGISTRATIONS
// ======================================================
//
// Useful for admin.
//
// GET /api/registrations/tournament/:tournamentId
//
// ======================================================

const getTournamentRegistrations =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Please login first.",
        });
      }

      const {
        tournamentId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          tournamentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      const tournament =
        await Tournament.findById(
          tournamentId
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      const registrations =
        await Registration.find({
          tournament:
            tournament._id,
        })
          .populate(
            "user",
            "fullName username email bgmiUid freeFireUid"
          )
          .populate(
            "tournament"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        tournament,

        count:
          registrations.length,

        registrations,
      });
    } catch (error) {
      console.error(
        "GET TOURNAMENT REGISTRATIONS ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createRegistration,

  getMyRegistrations,

  getRegistrationById,

  cancelRegistration,

  getTournamentRegistrations,
};