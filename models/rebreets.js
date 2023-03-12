const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./users");
const Breet = require("./breets");

const RebreetSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rebreeter: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  breet: {
    type: Schema.Types.ObjectId,
    ref: "Breet",
    required: true,
  },
});

module.exports = mongoose.model("Rebreet", RebreetSchema);
