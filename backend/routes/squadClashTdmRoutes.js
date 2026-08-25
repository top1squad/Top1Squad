const express = require("express");

const router = express.Router();

const {
  // Tournament
  createSquadClashTdm,
  getSquadClashTdm,
  getSquadClashTdmById,
  updateSquadClashTdm,
  deleteSquadClashTdm,

  // Player
  validatePlayerUid,

  // Team
  getTeamSlots,

  // Registration
  createSquadClashTdmRegistration,
  getMySquadClashTdmRegistrations,
  getSquadClashTdmRegistrations,
  updateSquadClashTdmRegistration,
  deleteSquadClashTdmRegistration,
} = require("../controllers/squadClashTdmController");

// ======================================================
// DEBUG
// ======================================================

console.log(
  "[SQUAD CLASH ROUTES] Controller loaded."
);

console.log(
  "[SQUAD CLASH ROUTES] create:",
  typeof createSquadClashTdm
);

console.log(
  "[SQUAD CLASH ROUTES] get:",
  typeof getSquadClashTdm
);

console.log(
  "[SQUAD CLASH ROUTES] getById:",
  typeof getSquadClashTdmById
);

console.log(
  "[SQUAD CLASH ROUTES] update:",
  typeof updateSquadClashTdm
);

console.log(
  "[SQUAD CLASH ROUTES] delete:",
  typeof deleteSquadClashTdm
);

console.log(
  "[SQUAD CLASH ROUTES] validatePlayer:",
  typeof validatePlayerUid
);

console.log(
  "[SQUAD CLASH ROUTES] teamSlots:",
  typeof getTeamSlots
);

// ======================================================
// TOURNAMENT
// ======================================================

// POST /api/squad-clash-tdm
router.post(
  "/",
  createSquadClashTdm
);

// GET /api/squad-clash-tdm
router.get(
  "/",
  getSquadClashTdm
);

// ======================================================
// PLAYER UID VALIDATION
// ======================================================

// Existing route
// GET /api/squad-clash-tdm/validate-player
router.get(
  "/validate-player",
  validatePlayerUid
);

// IMPORTANT:
// Frontend uses this route:
//
// GET /api/squad-clash-tdm/registrations/validate-player-uid
//
// Keep this route BEFORE dynamic /:tournamentId routes.
router.get(
  "/registrations/validate-player-uid",
  validatePlayerUid
);

// ======================================================
// REGISTRATIONS
// ======================================================

// POST /api/squad-clash-tdm/registrations
router.post(
  "/registrations",
  createSquadClashTdmRegistration
);

// GET /api/squad-clash-tdm/registrations/my
router.get(
  "/registrations/my",
  getMySquadClashTdmRegistrations
);

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

// ======================================================
// TEAM SLOTS
// ======================================================

// GET /api/squad-clash-tdm/:tournamentId/team-slots
router.get(
  "/:tournamentId/team-slots",
  getTeamSlots
);

// ======================================================
// SINGLE TOURNAMENT
//
// Dynamic routes MUST BE LAST.
// ======================================================

// GET /api/squad-clash-tdm/:tournamentId
router.get(
  "/:tournamentId",
  getSquadClashTdmById
);

// PATCH /api/squad-clash-tdm/:tournamentId
router.patch(
  "/:tournamentId",
  updateSquadClashTdm
);

// DELETE /api/squad-clash-tdm/:tournamentId
router.delete(
  "/:tournamentId",
  deleteSquadClashTdm
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;