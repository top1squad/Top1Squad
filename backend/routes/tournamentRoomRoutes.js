const express = require("express");

const {
  getTournamentRoom,
} = require(
  "../controllers/tournamentRoomController"
);

const router = express.Router();


// ======================================================
// GET ROOM DETAILS
// GET /api/tournaments/:id/room
// ======================================================

router.get(
  "/:id/room",
  getTournamentRoom
);


module.exports = router;