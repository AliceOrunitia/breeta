const appError = require("./appError");
const { breetSchema, rebreetSchema, userSchema } = require("./schemas.js");
const Breet = require("./models/breets");
const User = require("./models/users");
const Rebreet = require("./models/rebreets");

//Logged-in Middleware
module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/users/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const breet = await Breet.findById(id);
  if (breet.username !== req.user.username) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/breeta/${id}`);
  }
  next();
};

module.exports.isUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ username: id });
  if (user.username !== req.user.username) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/users/${id}`);
  }
  next();
};

//Joi validators
module.exports.validateBreet = (req, res, next) => {
  const sessionUser = req.user;
  req.body.breet.dName = sessionUser.dName;
  req.body.breet.pfp = sessionUser.pfp.url;
  req.body.breet.username = sessionUser.username;
  const { dName, content, pfp, username } = req.body.breet;
  const { error } = breetSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new appError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new appError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateRebreet = (req, res, next) => {
  const { error } = rebreetSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new appError(msg, 400);
  } else {
    next();
  }
};
