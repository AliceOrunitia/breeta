const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./users");
const Breet = require("./breets");

const LikeSchema = new Schema({
  breet: {
    type: Schema.Types.ObjectId,
    ref: "Breet",
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Like", LikeSchema);
