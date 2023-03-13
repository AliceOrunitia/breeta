const User = require("../models/users");
const Breet = require("../models/breets");
const Like = require("../models/likes");
const Rebreet = require("../models/rebreets");
const Notification = require("../models/notifications");
const functions = require("../functions.js");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

module.exports.registerUser = async (req, res, next) => {
  console.log("hit");
  try {
    const { email, dName, password, username, bio } = req.body.user;
    const creationDate = Date.now();
    let image;

    if (req.file) {
      image = { url: req.file.path, filename: req.file.filename };
    } else {
      image = {
        url: "https://res.cloudinary.com/breeta/image/upload/v1678363235/Breeta/breetaDefault_b1djbg.webp",
        filename: "breetaDefault_b1djbg",
      };
    }
    const user = new User({
      email,
      dName,
      username,
      bio,
      creationDate,
      pfp: image,
      likes: 0,
      rebreets: 0,
      breets: 0,
      notifications: 0,
    });
    const registeredUser = await User.register(user, password);
    const notification = new Notification({
      user: registeredUser._id,
      follows: [],
      breets: [],
    });
    await notification.save();
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Breeta!");
      res.redirect("/breeta");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/newuser");
  }
};
module.exports.renderNewUser = (req, res) => {
  res.render("./users/newuser", { functions });
};

module.exports.userProfile = async (req, res, next) => {
  const sessionUser = req.user;
  const user = await User.findOne({ username: req.params.id });
  const breets = await Breet.find({ username: user.username }).populate(
    "parent"
  );
  res.render("./users/profile", {
    functions,
    user,
    breets,
    sessionUser,
  });
};

module.exports.renderLogin = (req, res) => {
  res.render("./users/login", { functions });
};

module.exports.loginFlash = (req, res) => {
  req.flash("success", "welcome back");
  const redirectURL = req.session.returnTo || "/breeta";
  delete req.session.returnTo;
  res.redirect(redirectURL);
};

module.exports.renderNotifications = async (req, res, next) => {
  const sessionUser = req.user;
  const notification = await Notification.findOne({
    user: sessionUser._id,
  });
  const activeFollows = notification.follows.filter((follow) => follow.active);
  const activeReplies = notification.breets.flatMap((breet) =>
    breet.replies.filter((reply) => reply.active)
  );
  const activeLikes = notification.breets.flatMap((breet) =>
    breet.likes.filter((like) => like.active)
  );
  const activeRebreets = notification.breets.flatMap((breet) =>
    breet.rebreets.filter((rebreeter) => rebreeter.active)
  );
  const activeNotifications = [
    ...activeFollows,
    ...activeReplies,
    ...activeLikes,
    ...activeRebreets,
  ];

  const setInactive = async () => {
    // Set all active to inactive
    notification.follows.forEach((follow) => {
      if (follow.active) {
        follow.active = false;
      }
    });

    notification.breets.forEach((breet) => {
      breet.replies.forEach((reply) => {
        if (reply.active) {
          reply.active = false;
        }
      });

      breet.likes.forEach((like) => {
        if (like.active) {
          like.active = false;
        }
      });

      breet.rebreets.forEach((rebreeter) => {
        if (rebreeter.active) {
          rebreeter.active = false;
        }
      });
    });
    await setInactive();
    await notification.save();
    await User.findOneAndUpdate(
      { username: sessionUser.username },
      { $inc: { notifications: -activeNotifications.length } }
    );
  };

  // check if there are fewer than 20 active notifications
  if (activeNotifications.length < 20) {
    const inactiveFollows = notification.follows.filter(
      (follow) => !follow.active
    );
    const inactiveReplies = notification.breets.flatMap((breet) =>
      breet.replies.filter((reply) => !reply.active)
    );
    const inactiveLikes = notification.breets.flatMap((breet) =>
      breet.likes.filter((like) => !like.active)
    );
    const inactiveRebreets = notification.breets.flatMap((breet) =>
      breet.rebreets.filter((rebreeter) => !rebreeter.active)
    );

    const inactiveNotifications = [
      ...inactiveFollows,
      ...inactiveReplies,
      ...inactiveLikes,
      ...inactiveRebreets,
    ]
      .sort((a, b) => {
        b.time - a.time;
      })
      .slice(0, 20);
    setInactive();
    res.render("./users/notifications", {
      sessionUser,
      functions,
      activeNotifications,
      inactiveNotifications,
    });
  } else {
    setInactive();
    res.render("./users/notifications", {
      sessionUser,
      functions,
      activeNotifications,
    });
  }
};

module.exports.exploreUsers = async (req, res, next) => {
  const sessionUser = req.user;
  const users = await User.find({
    username: { $not: { $eq: sessionUser.username } },
  });
  res.render("./users/explore", { sessionUser, functions, users });
};

module.exports.followUnfollow = async (req, res, next) => {
  const sessionUser = req.user;
  const follow = req.params.id;
  const followor = await User.findOne({
    username: sessionUser.username,
  }); //person doing the following
  const followee = await User.findOne({ username: follow }); //person receiving the following
  // Follow
  if (!followor.following.includes(follow) && followor.username !== follow) {
    await User.findOneAndUpdate(
      { username: followor.username },
      { $push: { following: follow } }
    );
    await User.findOneAndUpdate(
      { username: followee.username },
      {
        $push: { followers: followor.username },
        $inc: { notifications: 1 },
      }
    );
    await Notification.findOneAndUpdate(
      { user: followee._id },
      {
        $push: {
          follows: {
            followor: sessionUser._id,
            active: true,
            time: new Date(),
          },
        },
      }
    );
    req.flash("success", `followed @${followee.username}`);
    //Unfollow
  } else if (followor.username !== follow) {
    const unfollowor = await User.findOne({
      username: followor.username,
    });
    await User.findOneAndUpdate(
      { username: followor.username },
      { $pull: { following: follow } }
    );
    await User.findOneAndUpdate(
      { username: followee.username },
      { $pull: { followers: followor.username } }
    );
    req.flash("success", `unfollowed @${followee.username}`);
  }
  res.redirect("back");
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "successfully logged out");
    res.redirect("/");
  });
};

module.exports.renderUserEdit = async (req, res, next) => {
  const sessionUser = req.user;
  const user = await User.findOne({ username: req.params.id });
  const breets = await Breet.find({ username: user.username }).populate(
    "parent"
  );
  res.render("./users/editUser", { functions, user, breets, sessionUser });
};

module.exports.editUser = async (req, res, next) => {
  const sessionUser = req.user;
  const id = req.user._id;
  let image;
  try {
    if (sessionUser.pfp.filename !== "breetaDefault_b1djbg") {
      await cloudinary.uploader.destroy(sessionUser.pfp.filename);
      if (req.file) {
        upload.single("image");
        image = { url: req.file.path, filename: req.file.filename };
      } else {
        image = {
          url: "https://res.cloudinary.com/breeta/image/upload/v1678363235/Breeta/breetaDefault_b1djbg.webp",
          filename: "breetaDefault_b1djbg",
        };
      }
    }
    const user = await User.findByIdAndUpdate(id, {
      ...req.body.user,
      image,
    });
    await user.save();
    req.flash("success", "Successfully updated breet");
    res.redirect(`/users/${user.username}`);
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("back");
  }
};

module.exports.deleteUser = async (req, res, next) => {
  const { _id, username } = req.user;
  const following = await User.find({
    following: { $elemMatch: { username } },
  });
  const followers = await User.find({
    following: { $elemMatch: { username } },
  });
  await User.updateMany(
    { following: { $elemMatch: { $eq: username } } },
    { $pull: { following: username } }
  );
  await User.updateMany(
    { followers: { $elemMatch: { $eq: username } } },
    { $pull: { followers: username } }
  );
  const images = await Breet.find({
    $and: [{ image: { $exists: true } }, { username: username }],
  })
    .lean(true)
    .then(async (data) => {
      if (data) {
        for (let d of data) {
          await cloudinary.uploader.destroy(d.image.filename);
        }
      }
    });
  const user = await User.findOne({ username: username });
  if (user.pfp.filename !== "breetaDefault_b1djbg") {
    await cloudinary.uploader.destroy(user.pfp.filename);
  }
  await Notification.deleteMany({ user: _id });
  await Rebreet.deleteMany({ rebreeter: username });
  await Breet.deleteMany({ user: _id });
  await Like.deleteMany({ author: _id });
  await User.deleteOne({ username });
  req.flash("success", "User deleted");
  res.redirect(`/`);
};
