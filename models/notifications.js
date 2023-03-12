const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./users");
const Breet = require("./breets");

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  follows: [
    {
      followor: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      active: {
        type: Boolean,
      },
      time: {
        type: Date,
      },
    },
  ],

  breets: [
    {
      breet: {
        type: Schema.Types.ObjectId,
        ref: "Breet",
      },

      likes: [
        {
          likor: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          active: {
            type: Boolean,
          },
          time: {
            type: Date,
          },
          breet: {
            type: Schema.Types.ObjectId,
            ref: "Breet",
          },
        },
      ],

      rebreets: [
        {
          rebreetor: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          active: {
            type: Boolean,
          },
          time: {
            type: Date,
          },
          breet: {
            type: Schema.Types.ObjectId,
            ref: "Breet",
          },
        },
      ],

      replies: [
        {
          replior: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          active: {
            type: Boolean,
          },
          time: {
            type: Date,
          },
          breet: {
            type: Schema.Types.ObjectId,
            ref: "Breet",
          },
          originalBreet: {
            type: Schema.Types.ObjectId,
            ref: "Breet",
          },
        },
      ],
    },
  ],
});

NotificationSchema.pre("findOne", function (next) {
  this.populate("user");
  this.populate("follows.followor");
  this.populate("breets.likes.likor");
  this.populate("breets.likes.breet");
  this.populate("breets.rebreets.rebreetor");
  this.populate("breets.rebreets.breet");
  this.populate("breets.replies.replior");
  this.populate("breets.replies.breet");
  this.populate("breets.replies.originalBreet");
  next();
});

module.exports = mongoose.model("Notification", NotificationSchema);
