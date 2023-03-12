const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./users");
// const Image = require("./images");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
const opts = { toJSON: { virtuals: true } };

const BreetSchema = new Schema({
  content: {
    type: String,
    required: true,
    min: [1, "must not be empty"],
    max: [300, "cannot exceed 300 characters"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pfp: {
    type: String,
    required: true,
  },
  dName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  image: ImageSchema,
  likes: {
    type: Number,
    default: 0,
    required: true,
  },
  replies: {
    type: Number,
    default: 0,
    required: true,
  },
  rebreets: {
    type: Number,
    default: 0,
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Breet",
    required: false,
  },
  views: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = mongoose.model("Breet", BreetSchema);
