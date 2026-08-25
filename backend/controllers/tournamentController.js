const mongoose = require("mongoose");

const Tournament = require("../models/Tournament");

const {
  createTournamentSchema,
  updateTournamentSchema,
} = require("../validators/tournamentValidator");

// ======================================================
// HELPERS
// ======================================================

function normalizeTournamentMode(mode) {
  return String(mode || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

// ======================================================

function isTdmOrSquadClash(mode) {
  const normalized =
    normalizeTournamentMode(mode);

  return (
    normalized === "tdm" ||
    normalized === "squad clash"
  );
}

// ======================================================

function normalizeModeForStorage(mode) {
  const normalized =
    normalizeTournamentMode(mode);

  if (normalized === "tdm") {
    return "TDM";
  }

  if (normalized === "squad clash") {
    return "Squad Clash";
  }

  if (normalized === "solo") {
    return "Solo";
  }

  if (normalized === "duo") {
    return "Duo";
  }

  if (normalized === "squad") {
    return "Squad";
  }

  return String(mode || "").trim();
}

// ======================================================

function normalizeRules(rules) {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules
    .map((rule) =>
      String(rule || "").trim()
    )
    .filter(Boolean);
}

// ======================================================
// CREATE TOURNAMENT
// POST /api/tournaments
// ======================================================

exports.createTournament = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "CREATE TOURNAMENT BODY:",
      req.body
    );

    // ==================================================
    // VALIDATE REQUEST
    // ==================================================

    const {
      error,
      value,
    } = createTournamentSchema.validate(
      req.body,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    // ==================================================
    // VALIDATION ERROR
    // ==================================================

    if (error) {
      console.log(
        "TOURNAMENT VALIDATION ERROR:",
        error.details
      );

      return res.status(400).json({
        success: false,
        message:
          "Tournament validation failed.",
        errors: error.details.map(
          (detail) => detail.message
        ),
      });
    }

    // ==================================================
    // NORMALIZE MODE
    // ==================================================

    value.mode =
      normalizeModeForStorage(
        value.mode
      );

    // ==================================================
    // NORMALIZE RULES
    // ==================================================

    value.rules =
      normalizeRules(value.rules);

    // ==================================================
    // REGISTERED TEAMS
    // ==================================================
    //
    // Every new tournament starts with 0 teams.
    // Admin cannot manually set this during creation.
    // ==================================================

    value.registeredTeams = 0;

    // ==================================================
    // TDM / SQUAD CLASH
    // ==================================================
    //
    // TDM and Squad Clash always have exactly
    // 2 teams.
    // ==================================================

    if (
      isTdmOrSquadClash(
        value.mode
      )
    ) {
      value.maxTeams = 2;
      value.registeredTeams = 0;
    }

    // ==================================================
    // NORMAL TOURNAMENT
    // ==================================================

    if (
      !isTdmOrSquadClash(
        value.mode
      )
    ) {
      value.maxTeams =
        Number(value.maxTeams);

      if (
        !Number.isInteger(
          value.maxTeams
        ) ||
        value.maxTeams < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum teams must be at least 1.",
        });
      }
    }

    // ==================================================
    // CREATE TOURNAMENT
    // ==================================================

    const tournament =
      await Tournament.create(
        value
      );

    console.log(
      "TOURNAMENT SAVED:",
      tournament._id
    );

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        isTdmOrSquadClash(
          tournament.mode
        )
          ? `${tournament.mode} tournament created successfully.`
          : "Tournament created successfully.",

      tournament,
    });
  } catch (error) {
    console.error(
      "CREATE TOURNAMENT ERROR:",
      error
    );

    next(error);
  }
};

// ======================================================
// GET ALL TOURNAMENTS
// GET /api/tournaments
// ======================================================

exports.getAllTournaments =
  async (
    req,
    res,
    next
  ) => {
    try {
      const tournaments =
        await Tournament.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        count:
          tournaments.length,
        tournaments,
      });
    } catch (error) {
      console.error(
        "GET TOURNAMENTS ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// GET SINGLE TOURNAMENT
// GET /api/tournaments/:id
// ======================================================

exports.getTournamentById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const tournamentId =
        req.params?.id ||
        req.params?.tournamentId;

      console.log(
        "GET TOURNAMENT:",
        tournamentId
      );

      // ==================================================
      // VALIDATE OBJECT ID
      // ==================================================

      if (
        !tournamentId ||
        !mongoose.Types.ObjectId.isValid(
          tournamentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      // ==================================================
      // FIND TOURNAMENT
      // ==================================================

      const tournament =
        await Tournament.findById(
          tournamentId
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,
        tournament,
      });
    } catch (error) {
      console.error(
        "GET TOURNAMENT ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// UPDATE TOURNAMENT
// PATCH /api/tournaments/:id
// ======================================================

exports.updateTournament =
  async (
    req,
    res,
    next
  ) => {
    try {
      const tournamentId =
        req.params?.id ||
        req.params?.tournamentId;

      console.log(
        "UPDATE TOURNAMENT:",
        tournamentId
      );

      console.log(
        "UPDATE BODY:",
        req.body
      );

      // ==================================================
      // VALIDATE OBJECT ID
      // ==================================================

      if (
        !tournamentId ||
        !mongoose.Types.ObjectId.isValid(
          tournamentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      // ==================================================
      // FIND EXISTING TOURNAMENT
      // ==================================================

      const existingTournament =
        await Tournament.findById(
          tournamentId
        );

      if (!existingTournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ==================================================
      // VALIDATE UPDATE BODY
      // ==================================================

      const {
        error,
        value,
      } = updateTournamentSchema.validate(
        req.body,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

      // ==================================================
      // VALIDATION ERROR
      // ==================================================

      if (error) {
        console.log(
          "UPDATE TOURNAMENT VALIDATION ERROR:",
          error.details
        );

        return res.status(400).json({
          success: false,
          message:
            "Tournament update validation failed.",
          errors: error.details.map(
            (detail) => detail.message
          ),
        });
      }

      // ==================================================
      // UPDATE DATA
      // ==================================================

      const updateData = {
        ...value,
      };

      // ==================================================
      // NORMALIZE MODE
      // ==================================================

      if (
        Object.prototype.hasOwnProperty.call(
          updateData,
          "mode"
        )
      ) {
        updateData.mode =
          normalizeModeForStorage(
            updateData.mode
          );
      }

      // ==================================================
      // NORMALIZE RULES
      // ==================================================

      if (
        Object.prototype.hasOwnProperty.call(
          updateData,
          "rules"
        )
      ) {
        updateData.rules =
          normalizeRules(
            updateData.rules
          );
      }

      // ==================================================
      // FINAL MODE
      // ==================================================

      const finalMode =
        Object.prototype.hasOwnProperty.call(
          updateData,
          "mode"
        )
          ? updateData.mode
          : existingTournament.mode;

      // ==================================================
      // TDM / SQUAD CLASH
      // ==================================================

      if (
        isTdmOrSquadClash(
          finalMode
        )
      ) {
        // Always exactly 2 teams
        updateData.maxTeams = 2;

        // ----------------------------------------------
        // REGISTERED TEAMS
        // ----------------------------------------------

        if (
          Object.prototype.hasOwnProperty.call(
            updateData,
            "registeredTeams"
          )
        ) {
          const registeredTeams =
            Number(
              updateData.registeredTeams
            );

          if (
            !Number.isInteger(
              registeredTeams
            ) ||
            registeredTeams < 0 ||
            registeredTeams > 2
          ) {
            return res.status(400).json({
              success: false,
              message:
                "TDM and Squad Clash can have only 0 to 2 registered teams.",
            });
          }

          updateData.registeredTeams =
            registeredTeams;
        }
      }

      // ==================================================
      // NORMAL TOURNAMENT
      // REGISTERED TEAMS
      // ==================================================

      if (
        Object.prototype.hasOwnProperty.call(
          updateData,
          "registeredTeams"
        ) &&
        !isTdmOrSquadClash(
          finalMode
        )
      ) {
        const registeredTeams =
          Number(
            updateData.registeredTeams
          );

        const finalMaxTeams =
          Object.prototype.hasOwnProperty.call(
            updateData,
            "maxTeams"
          )
            ? Number(
                updateData.maxTeams
              )
            : Number(
                existingTournament.maxTeams
              );

        if (
          !Number.isInteger(
            registeredTeams
          ) ||
          registeredTeams < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Registered teams must be a valid non-negative number.",
          });
        }

        if (
          registeredTeams >
          finalMaxTeams
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Registered teams cannot be greater than maximum teams.",
          });
        }

        updateData.registeredTeams =
          registeredTeams;
      }

      // ==================================================
      // NORMAL TOURNAMENT
      // MAX TEAMS
      // ==================================================

      if (
        Object.prototype.hasOwnProperty.call(
          updateData,
          "maxTeams"
        ) &&
        !isTdmOrSquadClash(
          finalMode
        )
      ) {
        const maxTeams =
          Number(
            updateData.maxTeams
          );

        if (
          !Number.isInteger(
            maxTeams
          ) ||
          maxTeams < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Maximum teams must be at least 1.",
          });
        }

        const currentRegisteredTeams =
          Number(
            existingTournament.registeredTeams ||
              0
          );

        if (
          currentRegisteredTeams >
          maxTeams
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Maximum teams cannot be lower than the current registered team count.",
          });
        }

        updateData.maxTeams =
          maxTeams;
      }

      // ==================================================
      // UPDATE DATABASE
      // ==================================================

      const tournament =
        await Tournament.findByIdAndUpdate(
          tournamentId,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          "Tournament updated successfully.",

        tournament,
      });
    } catch (error) {
      console.error(
        "UPDATE TOURNAMENT ERROR:",
        error
      );

      next(error);
    }
  };

// ======================================================
// DELETE TOURNAMENT
// DELETE /api/tournaments/:id
// ======================================================

exports.deleteTournament =
  async (
    req,
    res,
    next
  ) => {
    try {
      const tournamentId =
        req.params?.id ||
        req.params?.tournamentId;

      console.log(
        "DELETE TOURNAMENT:",
        tournamentId
      );

      // ==================================================
      // VALIDATE OBJECT ID
      // ==================================================

      if (
        !tournamentId ||
        !mongoose.Types.ObjectId.isValid(
          tournamentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      // ==================================================
      // DELETE
      // ==================================================

      const tournament =
        await Tournament.findByIdAndDelete(
          tournamentId
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          "Tournament deleted successfully.",

        tournament,
      });
    } catch (error) {
      console.error(
        "DELETE TOURNAMENT ERROR:",
        error
      );

      next(error);
    }
  };