const express = require("express");

const router = express.Router();

const {
  getSquadClashTdmRegistrations,
  updateSquadClashTdmRegistration,
  deleteSquadClashTdmRegistration,
  validatePlayerUid,
  getTeamSlots,
} = require("../controllers/squadClashTdmRegistrationController");

// ======================================================
// PLAYER UID VALIDATION
// ======================================================

// GET /api/squad-clash-tdm/registrations/validate-player-uid
router.get(
  "/registrations/validate-player-uid",
  validatePlayerUid
);

// ======================================================
// TEAM SLOTS
// ======================================================

// GET /api/squad-clash-tdm/registrations/:tournamentId/slots
router.get(
  "/registrations/:tournamentId/slots",
  getTeamSlots
);

// ======================================================
// REGISTRATIONS
// ======================================================

// GET /api/squad-clash-tdm/registrations/:tournamentId
router.get(
  "/registrations/:tournamentId",
  getSquadClashTdmRegistrations
);

// PATCH /api/squad-clash-tdm/registrations/:registrationId
router.patch(
  "/registrations/:registrationId",
  updateSquadClashTdmRegistration
);

// DELETE /api/squad-clash-tdm/registrations/:registrationId
router.delete(
  "/registrations/:registrationId",
  deleteSquadClashTdmRegistration
);

module.exports = router;