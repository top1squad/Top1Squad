const Joi = require("joi");

// ======================================================
// TEAM MATCH CREATE VALIDATOR
// ======================================================

const teamMatchCreateValidator = Joi.object({
  // ====================================================
  // NAME
  // ====================================================

  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty":
        "Match name is required.",

      "string.min":
        "Match name must contain at least 3 characters.",

      "string.max":
        "Match name cannot exceed 100 characters.",

      "any.required":
        "Match name is required.",
    }),

  // ====================================================
  // MATCH TYPE
  // ====================================================

  matchType: Joi.string()
    .valid("TDM", "Squad Clash")
    .required()
    .messages({
      "any.only":
        "Match type must be TDM or Squad Clash.",

      "any.required":
        "Match type is required.",
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
  // DATE
  // ====================================================

  date: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty":
        "Date is required.",

      "any.required":
        "Date is required.",
    }),

  // ====================================================
  // TIME
  // ====================================================

  time: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty":
        "Time is required.",

      "any.required":
        "Time is required.",
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
      "string.empty":
        "Map is required.",

      "any.required":
        "Map is required.",
    }),

  // ====================================================
  // ROOM
  // ====================================================

  roomId: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  roomPassword: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

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
    .optional(),

  // ====================================================
  // DESCRIPTION
  // ====================================================

  description: Joi.string()
    .trim()
    .max(2000)
    .allow("")
    .optional(),

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
    .optional(),
});

// ======================================================
// UPDATE VALIDATOR
// ======================================================

const teamMatchUpdateValidator =
  Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(100),

    matchType: Joi.string()
      .valid("TDM", "Squad Clash"),

    game: Joi.string()
      .valid("BGMI", "Free Fire"),

    prize: Joi.number()
      .min(0),

    entryFee: Joi.number()
      .min(0),

    date: Joi.string()
      .trim(),

    time: Joi.string()
      .trim(),

    map: Joi.string()
      .trim()
      .min(1)
      .max(100),

    roomId: Joi.string()
      .trim()
      .max(100)
      .allow(""),

    roomPassword: Joi.string()
      .trim()
      .max(100)
      .allow(""),

    status: Joi.string()
      .valid(
        "Upcoming",
        "Live",
        "Completed",
        "Cancelled"
      ),

    description: Joi.string()
      .trim()
      .max(2000)
      .allow(""),

    rules: Joi.array()
      .items(
        Joi.string()
          .trim()
          .min(1)
          .max(500)
      ),
  })
  .min(1);

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  teamMatchCreateValidator,
  teamMatchUpdateValidator,
};