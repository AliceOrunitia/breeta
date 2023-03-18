const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Breets = require("./breets");
const passportLocalMongoose = require("passport-local-mongoose");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
const opts = { toJSON: { virtuals: true } };

const UserSchema = new Schema({
  dName: {
    type: String,
    required: true,
    min: [6, "must be at least 6 characters"],
    max: [24, "cannot be longer than 24 characters"],
  },
  pfp: {
    type: ImageSchema,
  },
  bio: {
    type: String,
    required: false,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  following: {
    type: [String],
    required: true,
  },
  followers: {
    type: [String],
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  breets: {
    type: Number,
    required: true,
  },
  rebreets: {
    type: Number,
    required: true,
  },
  notifications: {
    type: Number,
    required: true,
  },
});

passwordValidator = function (password, cb) {
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
    password
  )
    ? cb(
        "A valid password must contain at least 8 characters, at least one uppercase and lowercase character, number and special case character"
      )
    : cb();
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
