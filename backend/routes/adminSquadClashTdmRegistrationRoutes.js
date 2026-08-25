const express = require("express");

const router = express.Router();

const {
  getSquadClashTdmRegistrations,
  updateSquadClashTdmRegistration,
  deleteSquadClashTdmRegistration
} = require("../controllers/squadClashTdmRegistrationController");

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