const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.breetSchema = Joi.object({
  breet: Joi.object({
    dName: Joi.string().required().escapeHTML(),
    content: Joi.string().required().min(1).max(300).escapeHTML(),
    pfp: Joi.string().required().escapeHTML(), //this could cause issues.
    username: Joi.string().required().escapeHTML(),
    time: Joi.date(),
    replies: Joi.number().max(0),
    rebreets: Joi.number().max(0),
    views: Joi.number().max(0),
  }),
});

module.exports.rebreetSchema = Joi.object({
  rebreet: Joi.object({
    rebreeter: Joi.string().required().escapeHTML(),
    time: Joi.date(),
  }),
});

module.exports.userSchema = Joi.object({
  user: Joi.object({
    dName: Joi.string().required().escapeHTML(),
    pfp: Joi.object({
      filename: Joi.string(),
      url: Joi.string(),
    }), // issue city
    username: Joi.string().required().escapeHTML(),
    password: Joi.string()
      .regex(
        RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
      )
      .required()
      .escapeHTML()
      .min(8)
      .max(50),
    bio: Joi.string().required().min(1).max(600).escapeHTML(),
    creationDate: Joi.date(),
    email: Joi.string().email().required().escapeHTML(), //could cause issues
    following: Joi.array(),
    followers: Joi.array(),
  }),
});
