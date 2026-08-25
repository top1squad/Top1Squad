const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name cannot exceed 50 characters",
    }),

  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username cannot exceed 20 characters",
      "string.pattern.base":
        "Username can contain only letters, numbers and underscore",
    }),

  mobile: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base":
        "Enter a valid 10-digit Indian mobile number",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .pattern(/@gmail\.com$/)
    .required()
    .messages({
      "string.empty": "Gmail address is required",
      "string.email": "Enter a valid email address",
      "string.pattern.base":
        "Only Gmail addresses are allowed",
    }),

  // ==========================================
  // PASSWORD
  // ==========================================

  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 100 characters",
    }),

  game: Joi.string()
    .valid("BGMI", "Free Fire")
    .required()
    .messages({
      "any.only": "Game must be BGMI or Free Fire",
    }),

  gameUid: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.empty": "Game UID is required",
      "string.min": "Game UID is too short",
      "string.max": "Game UID is too long",
    }),

  termsAccepted: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      "any.only":
        "You must accept Terms & Conditions and Privacy Policy",
    }),
});

module.exports = {
  registerSchema,
};