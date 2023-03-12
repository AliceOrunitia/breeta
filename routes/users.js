const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilities/wrapAsync");
const users = require("../controllers/users");
const appError = require("../appError");
const Joi = require("joi");

//Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/users");
const { isLoggedIn, isAuthor, isUser, validateUser } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//Log In
router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/users/login",
      keepSessionInfo: true,
    }),
    users.loginFlash
  );

router.get("/logout", users.logout);

router.get("/notifications", isLoggedIn, wrapAsync(users.renderNotifications));

//New User
router
  .route("/newuser")
  .get(users.renderNewUser)
  .post(upload.single("image"), validateUser, wrapAsync(users.registerUser));

router.get("/explore", isLoggedIn, wrapAsync(users.exploreUsers));

router
  .route("/:id")
  .get(isLoggedIn, wrapAsync(users.userProfile))
  .post(isLoggedIn, wrapAsync(users.followUnfollow));

router
  .route("/:id/edit")
  .get(isLoggedIn, isUser, users.renderUserEdit)
  .patch(isLoggedIn, isUser, wrapAsync(users.editUser))
  .delete(isLoggedIn, isUser, wrapAsync(users.deleteUser));

module.exports = router;
