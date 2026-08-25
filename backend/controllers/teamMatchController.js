const mongoose = require("mongoose");

const TeamMatch =
  require("../models/TeamMatch");

const {
  teamMatchCreateValidator,
  teamMatchUpdateValidator,
} = require("../validators/teamMatchValidator");

// ======================================================
// CREATE TEAM MATCH
// POST /api/team-matches
// ======================================================

exports.createTeamMatch = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "CREATE TEAM MATCH BODY:",
      req.body
    );

    // ==================================================
    // VALIDATE
    // ==================================================

    const {
      error,
      value,
    } =
      teamMatchCreateValidator.validate(
        req.body,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details
          .map(
            (detail) =>
              detail.message
          )
          .join(", "),
      });
    }

    // ==================================================
    // FORCE VALUES
    // ==================================================

    value.maxTeams = 2;
    value.registeredTeams = 0;
    value.mode = value.matchType;

    // ==================================================
    // CREATE
    // ==================================================

    const teamMatch =
      await TeamMatch.create(
        value
      );

    console.log(
      "TEAM MATCH SAVED:",
      teamMatch._id
    );

    return res.status(201).json({
      success: true,

      message:
        "Team match created successfully.",

      teamMatch,
    });
  } catch (error) {
    console.error(
      "CREATE TEAM MATCH ERROR:",
      error
    );

    next(error);
  }
};

// ======================================================
// GET ALL TEAM MATCHES
// GET /api/team-matches
// ======================================================

exports.getAllTeamMatches =
  async (req, res, next) => {
    try {
      const filter = {};

      // Optional filter
      if (req.query.matchType) {
        if (
          ![
            "TDM",
            "Squad Clash",
          ].includes(
            req.query.matchType
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid match type.",
          });
        }

        filter.matchType =
          req.query.matchType;
      }

      // Optional game filter
      if (req.query.game) {
        if (
          ![
            "BGMI",
            "Free Fire",
          ].includes(
            req.query.game
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid game.",
          });
        }

        filter.game =
          req.query.game;
      }

      const teamMatches =
        await TeamMatch.find(
          filter
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        count:
          teamMatches.length,

        teamMatches,
      });
    } catch (error) {
      console.error(
        "GET TEAM MATCHES ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// GET SINGLE TEAM MATCH
// GET /api/team-matches/:id
// ======================================================

exports.getTeamMatchById =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      // ==================================================
      // VALIDATE ID
      // ==================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid team match ID.",
        });
      }

      // ==================================================
      // FIND
      // ==================================================

      const teamMatch =
        await TeamMatch.findById(
          id
        );

      if (!teamMatch) {
        return res.status(404).json({
          success: false,
          message:
            "Team match not found.",
        });
      }

      return res.status(200).json({
        success: true,
        teamMatch,
      });
    } catch (error) {
      console.error(
        "GET TEAM MATCH ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// UPDATE TEAM MATCH
// PATCH /api/team-matches/:id
// ======================================================

exports.updateTeamMatch =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      // ==================================================
      // VALIDATE ID
      // ==================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid team match ID.",
        });
      }

      // ==================================================
      // FIND EXISTING
      // ==================================================

      const existing =
        await TeamMatch.findById(
          id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Team match not found.",
        });
      }

      // ==================================================
      // DO NOT MODIFY CLOSED MATCH
      // ==================================================

      if (
        existing.status ===
          "Completed" ||
        existing.status ===
          "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed or cancelled matches cannot be updated.",
        });
      }

      // ==================================================
      // VALIDATE UPDATE
      // ==================================================

      const {
        error,
        value,
      } =
        teamMatchUpdateValidator.validate(
          req.body,
          {
            abortEarly: false,
            stripUnknown: true,
          }
        );

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details
            .map(
              (detail) =>
                detail.message
            )
            .join(", "),
        });
      }

      // ==================================================
      // MATCH TYPE / MODE
      // ==================================================

      if (value.matchType) {
        value.mode =
          value.matchType;
      }

      // ==================================================
      // NEVER ACCEPT THESE FROM CLIENT
      // ==================================================

      delete value.maxTeams;
      delete value.registeredTeams;

      // ==================================================
      // UPDATE
      // ==================================================

      Object.assign(
        existing,
        value
      );

      // Always keep fixed
      existing.maxTeams = 2;

      // Mode must equal matchType
      existing.mode =
        existing.matchType;

      await existing.save();

      return res.status(200).json({
        success: true,

        message:
          "Team match updated successfully.",

        teamMatch: existing,
      });
    } catch (error) {
      console.error(
        "UPDATE TEAM MATCH ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// DELETE TEAM MATCH
// DELETE /api/team-matches/:id
// ======================================================

exports.deleteTeamMatch =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      // ==================================================
      // VALIDATE ID
      // ==================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid team match ID.",
        });
      }

      // ==================================================
      // FIND
      // ==================================================

      const teamMatch =
        await TeamMatch.findById(
          id
        );

      if (!teamMatch) {
        return res.status(404).json({
          success: false,
          message:
            "Team match not found.",
        });
      }

      // ==================================================
      // DON'T DELETE ACTIVE MATCH
      // ==================================================

      if (
        teamMatch.registeredTeams >
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A team match with registrations cannot be deleted.",
        });
      }

      // ==================================================
      // DELETE
      // ==================================================

      await TeamMatch.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        success: true,

        message:
          "Team match deleted successfully.",

        teamMatch,
      });
    } catch (error) {
      console.error(
        "DELETE TEAM MATCH ERROR:",
        error
      );

      next(error);
    }
  };