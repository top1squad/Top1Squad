const Joi = require("joi");

const matchValidator = Joi.object({
  tournament: Joi.string()
    .hex()
    .length(24)
    .required(),

  matchName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  game: Joi.string()
    .valid("BGMI", "Free Fire")
    .required(),

  map: Joi.string()
    .valid(
      "Erangel",
      "Miramar",
      "Sanhok",
      "Vikendi",
      "Bermuda"
    )
    .required(),

  date: Joi.date()
    .required(),

  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),

  maxTeams: Joi.number()
    .integer()
    .min(1)
    .required(),

  roomId: Joi.string()
    .trim()
    .allow("", null),

  roomPassword: Joi.string()
    .trim()
    .allow("", null),

  status: Joi.string()
    .valid(
      "upcoming",
      "live",
      "completed",
      "cancelled"
    )
    .default("upcoming"),

  roomVisible: Joi.boolean()
    .default(false),
});

module.exports = matchValidator;