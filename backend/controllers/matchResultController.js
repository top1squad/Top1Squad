const MatchResult = require("../models/MatchResult");

const Tournament = require("../models/Tournament");

const mongoose = require("mongoose");


// ==========================================
// ADD MATCH RESULT
// POST /api/match-results
// ==========================================

const createMatchResult = async (req, res, next) => {
  try {

    const {
      tournament,
      matchNumber,
      team,
      placement,
      kills,
      points,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !tournament ||
      !matchNumber ||
      !team ||
      !placement ||
      kills === undefined ||
      points === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All match result fields are required",
      });
    }


    // ==========================================
    // CHECK TOURNAMENT ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(tournament)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID",
      });
    }


    // ==========================================
    // FIND TOURNAMENT
    // ==========================================

    const tournamentData =
      await Tournament.findById(tournament);


    if (!tournamentData) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }


    // ==========================================
    // CHECK DUPLICATE RESULT
    // ==========================================

    const existingResult =
      await MatchResult.findOne({
        tournament,
        matchNumber,
        team: team.trim(),
      });


    if (existingResult) {
      return res.status(409).json({
        success: false,
        message:
          "This team already has a result for this match",
      });
    }


    // ==========================================
    // DETERMINE WIN
    // ==========================================

    const win =
      Number(placement) === 1;


    // ==========================================
    // CREATE RESULT
    // ==========================================

    const result =
      await MatchResult.create({
        tournament,

        matchNumber:
          Number(matchNumber),

        team:
          team.trim(),

        game:
          tournamentData.game,

        placement:
          Number(placement),

        kills:
          Number(kills),

        points:
          Number(points),

        win,
      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Match result added successfully",

      result,
    });

  } catch (error) {

    console.error(
      "Create match result error:",
      error
    );


    // Duplicate MongoDB index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This team already has a result for this match",
      });
    }


    next(error);
  }
};


// ==========================================
// GET ALL RESULTS OF TOURNAMENT
// GET /api/match-results/:tournamentId
// ==========================================

const getTournamentResults = async (
  req,
  res,
  next
) => {
  try {

    const {
      tournamentId,
    } = req.params;


    // ==========================================
    // CHECK ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        tournamentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID",
      });
    }


    // ==========================================
    // GET RESULTS
    // ==========================================

    const results =
      await MatchResult.find({
        tournament: tournamentId,
      })
        .sort({
          matchNumber: 1,
          placement: 1,
        });


    return res.status(200).json({
      success: true,

      count: results.length,

      results,
    });

  } catch (error) {

    next(error);

  }
};


module.exports = {
  createMatchResult,
  getTournamentResults,
};