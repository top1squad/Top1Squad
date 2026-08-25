const express = require("express");

const {
  getProfileStats,
} = require("../controllers/profileController");

const router = express.Router();


// ==========================================
// GET MY PROFILE STATISTICS
// ==========================================

router.get(
  "/stats",
  getProfileStats
);


module.exports = router;