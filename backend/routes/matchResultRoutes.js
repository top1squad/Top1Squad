const express = require("express");

const {
  createMatchResult,
  getTournamentResults,
} = require("../controllers/matchResultController");


const router = express.Router();


// ==========================================
// ADD MATCH RESULT
// POST /api/match-results
// ==========================================

router.post(
  "/",
  createMatchResult
);


// ==========================================
// GET ALL MATCH RESULTS
// GET /api/match-results/:tournamentId
// ==========================================

router.get(
  "/:tournamentId",
  getTournamentResults
);


module.exports = router;