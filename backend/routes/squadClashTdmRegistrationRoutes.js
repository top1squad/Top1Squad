const express = require("express");

const router = express.Router();

const {
  getSquadClashTdmRegistrations,
  updateSquadClashTdmRegistration,
  deleteSquadClashTdmRegistration,
  validatePlayerUid,
  getTeamSlots,
} = require("../controllers/squadClashTdmRegistrationController");

router.get(
  "/registrations/validate-player-uid",
  validatePlayerUid
);

router.get(
  "/registrations/:tournamentId/slots",
  getTeamSlots
);

router.get(
  "/registrations/:tournamentId",
  getSquadClashTdmRegistrations
);

router.patch(
  "/registrations/:registrationId",
  updateSquadClashTdmRegistration
);

router.delete(
  "/registrations/:registrationId",
  deleteSquadClashTdmRegistration
);

module.exports = router;