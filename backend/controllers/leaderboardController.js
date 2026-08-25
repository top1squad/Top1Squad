const mongoose = require("mongoose");

const Leaderboard = require("../models/Leaderboard");
const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");

// ======================================================
// GET TOURNAMENT LEADERBOARD
// GET /api/leaderboard/:tournamentId
// ======================================================

const getTournamentLeaderboard = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    // ==================================================
    // CHECK TOURNAMENT ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID.",
      });
    }

    // ==================================================
    // FIND LEADERBOARD
    // ==================================================

    const leaderboard = await Leaderboard.findOne({
      tournament: tournamentId,
    })
      .populate({
        path: "first.user",
        select:
          "_id username fullName email mobile game gameUid bgmiUid freeFireUid",
      })
      .populate({
        path: "first.registration",
      })
      .populate({
        path: "second.user",
        select:
          "_id username fullName email mobile game gameUid bgmiUid freeFireUid",
      })
      .populate({
        path: "second.registration",
      })
      .populate({
        path: "third.user",
        select:
          "_id username fullName email mobile game gameUid bgmiUid freeFireUid",
      })
      .populate({
        path: "third.registration",
      })
      .lean();

    // ==================================================
    // NO WINNERS
    // ==================================================

    if (!leaderboard) {
      return res.status(200).json({
        success: true,
        tournamentId,
        leaderboard: [],
      });
    }

    // ==================================================
    // FORMAT RESULT
    // ==================================================

    const result = [];

    // ==================================================
    // FIRST PLACE
    // ==================================================

    if (leaderboard.first) {
      result.push({
        rank: 1,

        userId: leaderboard.first.user?._id || null,

        userName:
          leaderboard.first.user?.fullName ||
          leaderboard.first.user?.username ||
          "Unknown",

        username:
          leaderboard.first.user?.username || "",

        teamName:
          leaderboard.first.teamName || "",

        gameUid:
          leaderboard.first.gameUid ||
          leaderboard.first.user?.gameUid ||
          "",

        registrationId:
          leaderboard.first.registration?._id ||
          leaderboard.first.registration ||
          null,
      });
    }

    // ==================================================
    // SECOND PLACE
    // ==================================================

    if (leaderboard.second) {
      result.push({
        rank: 2,

        userId: leaderboard.second.user?._id || null,

        userName:
          leaderboard.second.user?.fullName ||
          leaderboard.second.user?.username ||
          "Unknown",

        username:
          leaderboard.second.user?.username || "",

        teamName:
          leaderboard.second.teamName || "",

        gameUid:
          leaderboard.second.gameUid ||
          leaderboard.second.user?.gameUid ||
          "",

        registrationId:
          leaderboard.second.registration?._id ||
          leaderboard.second.registration ||
          null,
      });
    }

    // ==================================================
    // THIRD PLACE
    // ==================================================

    if (leaderboard.third) {
      result.push({
        rank: 3,

        userId: leaderboard.third.user?._id || null,

        userName:
          leaderboard.third.user?.fullName ||
          leaderboard.third.user?.username ||
          "Unknown",

        username:
          leaderboard.third.user?.username || "",

        teamName:
          leaderboard.third.teamName || "",

        gameUid:
          leaderboard.third.gameUid ||
          leaderboard.third.user?.gameUid ||
          "",

        registrationId:
          leaderboard.third.registration?._id ||
          leaderboard.third.registration ||
          null,
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      tournamentId,
      leaderboard: result,
    });
  } catch (error) {
    console.error(
      "GET LEADERBOARD ERROR:",
      error
    );

    next(error);
  }
};

// ======================================================
// ADMIN - SET TOURNAMENT WINNERS
// POST /api/leaderboard/:tournamentId
// ======================================================

const setTournamentWinners = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    const { winners } = req.body;

    // ==================================================
    // CHECK TOURNAMENT ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID.",
      });
    }

    // ==================================================
    // CHECK WINNERS ARRAY
    // ==================================================

    if (!Array.isArray(winners) || winners.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Exactly 3 winners are required.",
      });
    }

    // ==================================================
    // FIND RANKS
    // ==================================================

    const firstWinner = winners.find(
      (winner) => Number(winner.rank) === 1
    );

    const secondWinner = winners.find(
      (winner) => Number(winner.rank) === 2
    );

    const thirdWinner = winners.find(
      (winner) => Number(winner.rank) === 3
    );

    // ==================================================
    // CHECK RANKS
    // ==================================================

    if (
      !firstWinner ||
      !secondWinner ||
      !thirdWinner
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Winners must contain rank 1, 2 and 3.",
      });
    }

    // ==================================================
    // GET USER IDS
    // ==================================================

    const firstId = firstWinner.userId;
    const secondId = secondWinner.userId;
    const thirdId = thirdWinner.userId;

    // ==================================================
    // CHECK USER IDS
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(firstId) ||
      !mongoose.Types.ObjectId.isValid(secondId) ||
      !mongoose.Types.ObjectId.isValid(thirdId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner user ID.",
      });
    }

    // ==================================================
    // SAME USER CHECK
    // ==================================================

    const ids = [
      firstId.toString(),
      secondId.toString(),
      thirdId.toString(),
    ];

    if (new Set(ids).size !== 3) {
      return res.status(400).json({
        success: false,
        message:
          "The same user cannot have multiple positions.",
      });
    }

    // ==================================================
    // CHECK TOURNAMENT
    // ==================================================

    const tournament = await Tournament.findById(
      tournamentId
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found.",
      });
    }

    // ==================================================
    // GET REGISTRATIONS
    // ==================================================

    const registrations = await Registration.find({
      tournament: tournamentId,

      user: {
        $in: [firstId, secondId, thirdId],
      },

      registrationStatus: {
        $ne: "Cancelled",
      },
    }).lean();

    // ==================================================
    // CHECK REGISTRATIONS
    // ==================================================

    if (registrations.length !== 3) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected winners are not registered for this tournament.",
      });
    }

    // ==================================================
    // GET REGISTRATION FOR USER
    // ==================================================

    const getRegistration = (userId) => {
      return registrations.find(
        (registration) =>
          registration.user &&
          registration.user.toString() ===
            userId.toString()
      );
    };

    const firstRegistration =
      getRegistration(firstId);

    const secondRegistration =
      getRegistration(secondId);

    const thirdRegistration =
      getRegistration(thirdId);

    // ==================================================
    // CHECK ALL REGISTRATIONS
    // ==================================================

    if (
      !firstRegistration ||
      !secondRegistration ||
      !thirdRegistration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to find registration for one or more winners.",
      });
    }

    // ==================================================
    // CREATE WINNER OBJECTS
    // ==================================================

    const first = {
      registration: firstRegistration._id,

      user: firstId,

      teamName:
        firstWinner.teamName ||
        firstRegistration.teamName ||
        "Winner",

      gameUid:
        firstWinner.gameUid ||
        firstRegistration.gameUid ||
        "",
    };

    const second = {
      registration: secondRegistration._id,

      user: secondId,

      teamName:
        secondWinner.teamName ||
        secondRegistration.teamName ||
        "Winner",

      gameUid:
        secondWinner.gameUid ||
        secondRegistration.gameUid ||
        "",
    };

    const third = {
      registration: thirdRegistration._id,

      user: thirdId,

      teamName:
        thirdWinner.teamName ||
        thirdRegistration.teamName ||
        "Winner",

      gameUid:
        thirdWinner.gameUid ||
        thirdRegistration.gameUid ||
        "",
    };

    // ==================================================
    // VALIDATE GAME UID
    // ==================================================

    if (
      !first.gameUid ||
      !second.gameUid ||
      !third.gameUid
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Game UID is missing for one or more winners.",
      });
    }

    // ==================================================
    // CREATE / UPDATE LEADERBOARD
    // ==================================================

    const leaderboard =
      await Leaderboard.findOneAndUpdate(
        {
          tournament: tournamentId,
        },

        {
          $set: {
            tournament: tournamentId,
            first,
            second,
            third,
          },
        },

        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      )
        .populate({
          path: "first.user",
          select:
            "_id username fullName game gameUid bgmiUid freeFireUid",
        })
        .populate({
          path: "second.user",
          select:
            "_id username fullName game gameUid bgmiUid freeFireUid",
        })
        .populate({
          path: "third.user",
          select:
            "_id username fullName game gameUid bgmiUid freeFireUid",
        });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Tournament winners announced successfully.",

      leaderboard,
    });
  } catch (error) {
    console.error(
      "SET TOURNAMENT WINNERS ERROR:",
      error
    );

    next(error);
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getTournamentLeaderboard,
  setTournamentWinners,
};