const express = require("express");

const router = express.Router();

const registrationController =
  require("../controllers/registrationController");

// ======================================================
// REGISTRATION ROUTES
// ======================================================

// CREATE REGISTRATION
// POST /api/registrations

router.post(
  "/",
  registrationController.createRegistration
);

// GET MY REGISTRATIONS
// GET /api/registrations/my
//
// IMPORTANT:
// Keep this route before /:id.

router.get(
  "/my",
  registrationController.getMyRegistrations
);

// GET SINGLE REGISTRATION
// GET /api/registrations/:id

router.get(
  "/:id",
  registrationController.getRegistrationById
);

// CANCEL REGISTRATION
// PATCH /api/registrations/:id/cancel

router.patch(
  "/:id/cancel",
  registrationController.cancelRegistration
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;