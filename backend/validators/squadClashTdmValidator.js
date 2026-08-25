const Joi = require("joi");

// ======================================================
// CREATE TOURNAMENT SCHEMA
// ======================================================

const createTournamentSchema = Joi.object({
  // ====================================================
  // NAME
  // ====================================================

  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      "any.required":
        "Tournament name is required.",

      "string.empty":
        "Tournament name is required.",

      "string.min":
        "Tournament name must contain at least 2 characters.",

      "string.max":
        "Tournament name cannot exceed 150 characters.",
    }),

  // ====================================================
  // GAME
  // ====================================================

  game: Joi.string()
    .valid("BGMI", "Free Fire")
    .required()
    .messages({
      "any.only":
        "Game must be BGMI or Free Fire.",

      "any.required":
        "Game is required.",
    }),

  // ====================================================
  // PRIZE
  // ====================================================

  prize: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base":
        "Prize must be a number.",

      "number.min":
        "Prize cannot be negative.",

      "any.required":
        "Prize is required.",
    }),

  // ====================================================
  // ENTRY FEE
  // ====================================================

  entryFee: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base":
        "Entry fee must be a number.",

      "number.min":
        "Entry fee cannot be negative.",

      "any.required":
        "Entry fee is required.",
    }),

  // ====================================================
  // MAX TEAMS
  // ====================================================

  maxTeams: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base":
        "Maximum teams must be a number.",

      "number.integer":
        "Maximum teams must be a whole number.",

      "number.min":
        "Maximum teams must be at least 1.",

      "any.required":
        "Maximum teams is required.",
    }),

  // ====================================================
  // REGISTERED TEAMS
  // ====================================================

  registeredTeams: Joi.number()
    .integer()
    .min(0)
    .default(0),

  // ====================================================
  // DATE
  // ====================================================

  date: Joi.alternatives()
    .try(
      Joi.string()
        .trim()
        .min(1),

      Joi.date()
    )
    .required()
    .messages({
      "any.required":
        "Tournament date is required.",
    }),

  // ====================================================
  // TIME
  // ====================================================

  time: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      "any.required":
        "Tournament time is required.",

      "string.empty":
        "Tournament time is required.",
    }),

  // ====================================================
  // MODE
  // ====================================================

  mode: Joi.string()
    .trim()
    .valid(
      "Solo",
      "Duo",
      "Squad",
      "TDM",
      "Squad Clash"
    )
    .required()
    .messages({
      "any.only":
        "Mode must be Solo, Duo, Squad, TDM or Squad Clash.",

      "any.required":
        "Tournament mode is required.",
    }),

  // ====================================================
  // MAP
  // ====================================================

  map: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required":
        "Map is required.",

      "string.empty":
        "Map is required.",
    }),

  // ====================================================
  // ROOM ID
  // ====================================================

  roomId: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .default(""),

  // ====================================================
  // ROOM PASSWORD
  // ====================================================

  roomPassword: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .default(""),

  // ====================================================
  // STATUS
  // ====================================================

  status: Joi.string()
    .valid(
      "Upcoming",
      "Live",
      "Completed",
      "Cancelled"
    )
    .default("Upcoming"),

  // ====================================================
  // DESCRIPTION
  // ====================================================

  description: Joi.string()
    .trim()
    .max(5000)
    .allow("")
    .default(""),

  // ====================================================
  // RULES
  // ====================================================

  rules: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(500)
    )
    .default([]),
});

// ======================================================
// UPDATE TOURNAMENT SCHEMA
// ======================================================

const updateTournamentSchema =
  createTournamentSchema
    .fork(
      [
        "name",
        "game",
        "prize",
        "entryFee",
        "maxTeams",
        "date",
        "time",
        "mode",
        "map",
      ],
      (schema) =>
        schema.optional()
    )
    .keys({
      registeredTeams:
        Joi.number()
          .integer()
          .min(0)
          .optional(),

      roomId:
        Joi.string()
          .trim()
          .max(100)
          .allow("")
          .optional(),

      roomPassword:
        Joi.string()
          .trim()
          .max(100)
          .allow("")
          .optional(),

      status:
        Joi.string()
          .valid(
            "Upcoming",
            "Live",
            "Completed",
            "Cancelled"
          )
          .optional(),

      description:
        Joi.string()
          .trim()
          .max(5000)
          .allow("")
          .optional(),

      rules:
        Joi.array()
          .items(
            Joi.string()
              .trim()
              .min(1)
              .max(500)
          )
          .optional(),
    })
    .min(1);

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,

  // Compatibility exports
  tournamentValidator:
    createTournamentSchema,

  createTournamentValidator:
    createTournamentSchema,

  updateTournamentValidator:
    updateTournamentSchema,
};