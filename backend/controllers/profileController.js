const Registration = require("../models/Registration");
const Tournament = require("../models/Tournament");


// ==========================================
// GET MY PROFILE STATISTICS
// GET /api/profile/stats
// ==========================================

const getProfileStats = async (req, res, next) => {
  try {

    // ==========================================
    // CURRENT LOGGED-IN USER
    // ==========================================

    const userId = req.user._id;


    // ==========================================
    // TOTAL TOURNAMENTS JOINED
    // ==========================================

    const tournamentsJoined =
      await Registration.countDocuments({
        user: userId,
        registrationStatus: {
          $ne: "Cancelled",
        },
      });


    // ==========================================
    // TOTAL TOURNAMENTS WON
    // ==========================================

    const tournamentsWon =
      await Tournament.countDocuments({
        winner: userId,
      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      stats: {
        tournamentsJoined,
        tournamentsWon,
      },
    });

  } catch (error) {

    next(error);

  }
};


module.exports = {
  getProfileStats,
};