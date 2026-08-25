const express = require("express");

const router = express.Router();

const tournamentController =
  require("../controllers/tournamentController");

const tournamentRoomController =
  require("../controllers/tournamentRoomController");

// ======================================================
// TOURNAMENT ROUTES
// ======================================================

// GET ALL TOURNAMENTS
// GET /api/tournaments

router.get(
  "/",
  tournamentController.getAllTournaments
);

// GET SINGLE TOURNAMENT
// GET /api/tournaments/:id

router.get(
  "/:id",
  tournamentController.getTournamentById
);

// GET TOURNAMENT ROOM
// GET /api/tournaments/:id/room
//
// IMPORTANT:
// This route must come BEFORE any generic route that
// could interpret "room" as an ID.

router.get(
  "/:id/room",
  tournamentRoomController.getTournamentRoom
);

// CREATE TOURNAMENT
// POST /api/tournaments

router.post(
  "/",
  tournamentController.createTournament
);

// UPDATE TOURNAMENT
// PATCH /api/tournaments/:id

router.patch(
  "/:id",
  tournamentController.updateTournament
);

// DELETE TOURNAMENT
// DELETE /api/tournaments/:id

router.delete(
  "/:id",
  tournamentController.deleteTournament
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;