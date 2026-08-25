const mongoose = require("mongoose");

const Tournament = require("../models/Tournament");
const Registration = require("../models/Registration");

// ======================================================
// GET TOURNAMENT ROOM DETAILS
// GET /api/tournaments/:id/room
// ======================================================
//
// Rules:
//
// 1. User must be logged in.
// 2. Tournament must exist.
// 3. User must have an active registration.
// 4. Tournament must be Live.
// 5. Room ID and password must exist.
//
// This works for:
// - Solo
// - Duo
// - Squad
// - TDM
// - Squad Clash
//
// All modes use the same Tournament collection.
// ======================================================

const getTournamentRoom = async (
  req,
  res,
  next
) => {
  try {
    // ==================================================
    // AUTHENTICATION
    // ==================================================

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Please login first.",
      });
    }

    // ==================================================
    // GET TOURNAMENT ID
    // ==================================================

    const tournamentId =
      req.params?.id ||
      req.params?.tournamentId ||
      req.params?.matchId;

    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (
      !tournamentId ||
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

    // ==================================================
    // FIND TOURNAMENT
    // ==================================================

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

    // ==================================================
    // CHECK USER REGISTRATION
    // ==================================================

    const registration =
      await Registration.findOne({
        user: req.user._id,

        tournament:
          tournament._id,

        registrationStatus: {
          $ne: "Cancelled",
        },
      });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message:
          "You are not registered for this tournament.",
      });
    }

    // ==================================================
    // ROOM IS AVAILABLE ONLY WHEN LIVE
    // ==================================================

    if (
      tournament.status !== "Live"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Room details are available only when the tournament is Live.",
        status:
          tournament.status,
      });
    }

    // ==================================================
    // CHECK ROOM ID
    // ==================================================

    const roomId =
      String(
        tournament.roomId || ""
      ).trim();

    if (!roomId) {
      return res.status(404).json({
        success: false,
        message:
          "Room ID has not been added yet.",
      });
    }

    // ==================================================
    // CHECK ROOM PASSWORD
    // ==================================================

    const roomPassword =
      String(
        tournament.roomPassword || ""
      ).trim();

    if (!roomPassword) {
      return res.status(404).json({
        success: false,
        message:
          "Room password has not been added yet.",
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Room details loaded successfully.",

      tournament: {
        id:
          tournament._id,

        name:
          tournament.name,

        game:
          tournament.game,

        mode:
          tournament.mode,

        status:
          tournament.status,

        date:
          tournament.date,

        time:
          tournament.time,

        map:
          tournament.map,
      },

      room: {
        roomId,

        roomPassword,
      },

      registration: {
        id:
          registration._id,

        teamName:
          registration.playerTeamName,

        registrationStatus:
          registration.registrationStatus,
      },
    });
  } catch (error) {
    console.error(
      "GET TOURNAMENT ROOM ERROR:",
      error
    );

    next(error);
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getTournamentRoom,
};