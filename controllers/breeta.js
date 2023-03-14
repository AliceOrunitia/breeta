const User = require("../models/users");
const Breet = require("../models/breets");
const Like = require("../models/likes");
const Rebreet = require("../models/rebreets");
const Notification = require("../models/notifications");
const functions = require("../functions.js");
const { session } = require("passport");
const { cloudinary } = require("../cloudinary");

module.exports.renderBreeta = async (req, res, next) => {
  delete req.session.pageNum;
  delete req.session.lastBreet;
  const sessionUser = req.user;
  let feed = [];
  try {
    const baseBreets = await Breet.find({
      $or: [
        { username: sessionUser.username },
        {
          username: { $in: sessionUser.following },
        },
      ],
    })
      .sort({ time: -1 })
      .limit(15)
      .populate("parent");
    if (baseBreets) {
      feed = baseBreets;
    }
  } catch (e) {
    console.log(e);
  }
  try {
    const rebreets = await Rebreet.find({
      $or: [
        { rebreeter: sessionUser.username },
        {
          rebreeter: { $in: sessionUser.following },
        },
      ],
    })
      .sort({ time: -1 })
      .limit(20 - feed.length)
      .populate("breet");
    if (rebreets) {
      feed = [...feed, ...rebreets].sort((a, b) => {
        return b.time - a.time;
      });
    }
  } catch (e) {
    console.log(e);
  }
  let breets = [];
  if (feed.length) {
    for (let breet of feed) {
      if (breet.content) {
        breets.push(breet);
      } else {
        breets.push({ ...breet.breet._doc, rebreeter: breet.rebreeter });
      }
    }
    req.session.lastBreet = breets[breets.length-1]
  }
  req.session.pageNum = 1;
  res.render("./breeta/breeta", {
    breets,
    functions,
    sessionUser,
  });
};

module.exports.renderNewBreet = (req, res) => {
  const sessionUser = req.user;
  res.render("./breeta/breet", { functions, sessionUser });
};

module.exports.postBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const { content, location } = req.body.breet;
  const breet = new Breet({
    content: content,
    pfp: sessionUser.pfp.url,
    user: sessionUser._id,
    dName: sessionUser.dName,
    username: sessionUser.username,
    time: new Date(),
    location: "",
    likes: 0,
    replies: 0,
    rebreets: 0,
    views: 0,
  });
  if (req.file) {
    breet.image = { url: req.file.path, filename: req.file.filename };
  }
  await breet.save();
  const like = new Like({
    breet: breet._id,
    author: sessionUser._id,
    likes: [],
  });
  await like.save();
  const notification = await Notification.findOne({ user: sessionUser._id });
  notification.breets.push({
    breet: breet._id,
    likes: [],
    rebreets: [],
    replies: [],
  });
  await notification.save();
  await User.findByIdAndUpdate(sessionUser._id, { $inc: { breets: 1 } });
  res.redirect("/breeta");
};

module.exports.renderReply = async (req, res, next) => {
  const sessionUser = req.user;
  const breet = await Breet.findOne({ _id: req.params.id }).populate("parent");
  res.render("./breeta/reply", { functions, sessionUser, breet });
};

module.exports.postReply = async (req, res, next) => {
  const sessionUser = req.user;
  const { id } = req.params;
  const { content, location } = req.body.breet;
  const breet = new Breet({
    content: content,
    pfp: sessionUser.pfp.url,
    user: sessionUser._id,
    dName: sessionUser.dName,
    username: sessionUser.username,
    time: new Date(),
    location: "",
    likes: 0,
    replies: 0,
    rebreets: 0,
    parent: id,
    views: 0,
  });
  if (req.file) {
    breet.image = { url: req.file.path, filename: req.file.filename };
  }
  await breet.save();
  await Breet.updateOne({ _id: id }, { $inc: { replies: 1 } });
  const like = new Like({
    breet: breet._id,
    author: sessionUser._id,

    likes: [],
  });
  await like.save();
  const notification = await Notification.findOne({ user: sessionUser._id });
  notification.breets.push({
    breet: breet._id,
    likes: [],
    rebreets: [],
    replies: [],
  });
  await notification.save();
  const breetN = await Breet.findById(id);
  await User.findOneAndUpdate(
    { username: breetN.username },
    { $inc: { notifications: 1 } }
  );
  await Notification.findOneAndUpdate(
    { "breets.breet": breetN._id },
    {
      $push: {
        "breets.$.replies": {
          replior: sessionUser._id,
          active: true,
          time: new Date(),
          breet: breet._id,
          originalBreet: id,
        },
      },
    },
    { new: true }
  );
  await User.findByIdAndUpdate(sessionUser._id, { $inc: { breets: 1 } });
  res.redirect("/breeta");
};

module.exports.renderBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const breet = await Breet.findById(req.params.id).populate("parent");
  const breets = await Breet.find({ parent: breet._id })
    .populate("parent")
    .sort({ time: -1 });
  breets.sort((a, b) => {
    return b.likes - a.likes;
  });
  res.render("./breeta/show", { breet, functions, sessionUser, breets });
};

module.exports.renderEditBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const breet = await Breet.findById(req.params.id);
  res.render("./breeta/edit", { breet, functions, sessionUser });
};

module.exports.editBreet = async (req, res, next) => {
  const { id } = req.params;
  const breet = await Breet.findByIdAndUpdate(id, {
    ...req.body.breet,
  });
  await breet.save();
  req.flash("success", "Unrebreeted!");
  res.redirect(`/breeta/${breet._id}`);
};

module.exports.reBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const { id } = req.params;
  const rebreet = await Rebreet.findOne({ breet: id });
  // Unrebreet
  if (rebreet) {
    await User.findByIdAndUpdate(sessionUser._id, { $inc: { rebreets: -1 } });
    await Breet.findByIdAndUpdate(id, { $inc: { rebreets: -1 } });
    await Rebreet.findOneAndDelete({ breet: id });
    req.flash("success", "Rebreeted!");
    return res.redirect("back");
  }
  //Rebreet
  await User.findByIdAndUpdate(sessionUser._id, {
    $inc: { rebreets: 1, notifications: 1 },
  });
  await Breet.findByIdAndUpdate(id, { $inc: { rebreets: 1 } });
  await Rebreet.findOneAndUpdate(
    { breet: id },
    {
      user_id: sessionUser._id,
      rebreeter: sessionUser.username,
      time: new Date(),
      breet: id,
    },
    { new: true, upsert: true }
  );
  const breet = await Breet.findById(id);
  const user = await User.findOne({ username: breet.username });
  await Notification.findOneAndUpdate(
    { "breets.breet": id },
    {
      $push: {
        "breets.$.rebreets": {
          rebreetor: sessionUser._id,
          active: true,
          time: new Date(),
          breet: breet._id,
        },
      },
    },
    { new: true }
  );
  req.flash("success", "Rebreeted!");
  res.redirect("back");
};

module.exports.deleteBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const { id } = req.params;
  const breet = await Breet.findOne({ _id: id });
  if (breet.image) {
    await cloudinary.uploader.destroy(breet.image.filename);
  }
  await Breet.findByIdAndDelete(id);
  await Like.findOneAndDelete({ breet: id });
  await Rebreet.findOneAndDelete({ breet: id });
  await User.findByIdAndUpdate(sessionUser._id, { $inc: { breets: -1 } });
  await Notification.findOneAndUpdate(
    { user: sessionUser._id },
    { $pull: { breets: { breet: id } } }
  );
  req.flash("success", "Breet deleted");
  res.redirect("/breeta");
};

module.exports.likeBreet = async (req, res, next) => {
  const sessionUser = req.user;
  const breet = await Breet.findById(req.params.id);
  const id = breet._id;
  const like = await Like.findOne({ breet: id });
  if (like.likes.includes(sessionUser._id)) {
    await User.findByIdAndUpdate(sessionUser._id, { $inc: { likes: -1 } });
    await Breet.updateOne({ _id: breet._id }, { $inc: { likes: -1 } });
    await Like.findByIdAndUpdate(like._id, {
      $pull: { likes: sessionUser._id },
    });
    return res.redirect("back");
  } else {
    await User.findByIdAndUpdate(sessionUser._id, {
      $inc: { 
        likes: 1,
        notifications: 1 },
    });
    await Breet.updateOne({ _id: breet._id }, { $inc: { likes: 1 } });
    await Like.findByIdAndUpdate(like._id, {
      $push: { likes: sessionUser._id },
    });
    const breetN = await Breet.findById(id);
    const userN = await User.findOne({ username: breetN.username });
    await Notification.findOneAndUpdate(
      { "breets.breet": breetN._id },
      {
        $push: {
          "breets.$.likes": {
            likor: sessionUser._id,
            active: true,
            time: new Date(),
            breet: breetN._id,
          },
        },
      },
      { new: true }
    );
    return res.redirect("back");
  }
};

module.exports.renderBreets = async (req, res, next) => {
  console.log("renderBreets controller hit")
  console.log("session:", req.session);
  console.log("body:", req.body);
  req.session.pageNum += 1;
  console.log("got to here")
  console.log("req.user:", req.user);
  console.log("req.user:", req.user)
  const sessionUser = req.user;
  console.log("new sessionUser attempt:", sessionUser);
  const lastBreet = req.session.lastBreet.time;
  console.log("lastBreet:", lastBreet);
    console.log("got to here 2")
    let feed = [];
  try{
  const baseBreets = await Breet.find({
    $or: [
      {
        $and: [
          { username: sessionUser.username },
          { time: { $lt: lastBreet } },
        ],
      },
      {
        $and: [
          { username: { $in: sessionUser.following } },
          { time: { $lt: lastBreet } },
        ],
      },
    ],
  })
    .sort({ time: -1 })
    .limit(15)
    .populate("parent");
      try{
  const rebreets = await Rebreet.find({
    $or: [
      {
        $and: [
          { rebreeter: sessionUser.username },
          { time: { $lt: lastBreet } },
        ],
      },
      {
        $and: [
          { rebreeter: { $in: sessionUser.following } },
          { time: { $lt: lastBreet } },
        ],
      },
    ],
  })
    .sort({ time: -1 })
    .limit(20 - baseBreets.length)
    .populate("breet");
            if (rebreets) {
      feed = [...feed, ...rebreets].sort((a, b) => {
        return b.time - a.time;
      });
    }
  } catch(e){
    console.log("boo hoo bitch face")
    console.log(e);
  }
  } catch(e){
    console.log("wahhh")
    console.log("error:", e)
  }
    console.log("got to here 4")

    console.log("got to here 5")
  const feed = [...baseBreets, ...rebreets].sort((a, b) => {
    return b.time - a.time;
  });
    console.log("got to here 6")

  let breets = [];
  for (let breet of feed) {
    if (breet.content) {
        console.log("breet content if")
      breets.push(breet);
    } else {
      console.log("breet feed else hit")
      breets.push({ ...breet.breet._doc, rebreeter: breet.rebreeter });
    }
  }
    console.log("got to here 7")
  if (breets.length) {
      console.log("breet length if")
    req.session.lastBreet = breets.findLast((e) => e.time).time;
  }
    console.log("end of controller");
  console.log(breets);
  res.json({ breets, sessionUser });
};
