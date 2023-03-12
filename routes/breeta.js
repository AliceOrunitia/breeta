const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utilities/wrapAsync");
const breeta = require("../controllers/breeta");
const appError = require("../appError");
const Joi = require("joi");
const Breet = require("../models/breets");

const {
  isLoggedIn,
  isAuthor,
  validateBreet,
  validateRebreet,
} = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/users");

router.get("/", isLoggedIn, wrapAsync(breeta.renderBreeta));

router
  .route("/breet")
  .get(isLoggedIn, breeta.renderNewBreet)
  .post(
    isLoggedIn,
    upload.single("image"),
    validateBreet,
    wrapAsync(breeta.postBreet)
  );

router.get("/scroller", isLoggedIn, wrapAsync(breeta.renderBreets));

router.get("/:id", isLoggedIn, wrapAsync(breeta.renderBreet));

router.get("/:id/like", isLoggedIn, wrapAsync(breeta.likeBreet));

router.get("/:id/rebreet", isLoggedIn, wrapAsync(breeta.reBreet));

router
  .route("/:id/reply")
  .get(isLoggedIn, wrapAsync(breeta.renderReply))
  .post(isLoggedIn, upload.single("image"), wrapAsync(breeta.postReply));

router
  .route("/:id/edit")
  .get(isLoggedIn, isAuthor, wrapAsync(breeta.renderEditBreet))
  .patch(isLoggedIn, isAuthor, wrapAsync(breeta.editBreet))
  .delete(isLoggedIn, isAuthor, wrapAsync(breeta.deleteBreet));

module.exports = router;
