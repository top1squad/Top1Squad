const express = require("express");

const {
  getTournamentLeaderboard,
  setTournamentWinners,
} = require("../controllers/leaderboardController");

const router = express.Router();

// ======================================================
// PUBLIC
// GET TOURNAMENT LEADERBOARD
// ======================================================

router.get(
  "/:tournamentId",
  getTournamentLeaderboard
);

// ======================================================
// ADMIN
// POST TOURNAMENT WINNERS
// ======================================================

router.post(
  "/:tournamentId",
  setTournamentWinners
);

module.exports = router;