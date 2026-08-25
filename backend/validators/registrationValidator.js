const Joi = require("joi");

// ======================================================
// REGISTRATION VALIDATOR
// ======================================================
//
// Supported:
// Solo  -> 1 player
// Duo   -> 2 players
// Squad -> 4 players
//
// TDM / Squad Clash should use their own controller.
//
// ======================================================

const registrationSchema = Joi.object({

  // ====================================================
  // TOURNAMENT
  // ====================================================

  tournament: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required":
        "Tournament ID is required.",

      "string.empty":
        "Tournament ID is required.",

      "string.base":
        "Tournament ID must be a valid string.",
    }),

  // ====================================================
  // PLAYER / TEAM NAME
  // ====================================================

  playerTeamName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "any.required":
        "Player or team name is required.",

      "string.empty":
        "Player or team name is required.",

      "string.min":
        "Player or team name must contain at least 2 characters.",

      "string.max":
        "Player or team name cannot exceed 100 characters.",
    }),

  // ====================================================
  // PRIMARY GAME UID
  // ====================================================

  gameUid: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required":
        "Game UID is required.",

      "string.empty":
        "Game UID is required.",

      "string.max":
        "Game UID cannot exceed 100 characters.",
    }),

  // ====================================================
  // PLAYERS
  // ====================================================

  players: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
    )
    .min(1)
    .max(4)
    .required()
    .messages({
      "any.required":
        "Player Game IDs are required.",

      "array.base":
        "Players must be provided as an array.",

      "array.min":
        "At least one player Game ID is required.",

      "array.max":
        "A maximum of 4 player Game IDs is allowed.",

      "string.empty":
        "Player Game ID cannot be empty.",
    }),

  // ====================================================
  // OPTIONAL UTR
  // ====================================================

  utr: Joi.string()
    .trim()
    .uppercase()
    .max(100)
    .allow("")
    .allow(null)
    .default(null)
    .messages({
      "string.max":
        "UTR / Transaction ID cannot exceed 100 characters.",
    }),

})

// ======================================================
// DO NOT ALLOW USER TO SET BACKEND CONTROLLED FIELDS
// ======================================================

.unknown(false);

// ======================================================
// EXPORT
// ======================================================

module.exports = registrationSchema;