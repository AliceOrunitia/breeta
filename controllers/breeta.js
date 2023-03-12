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
      $inc: { likes: 1 },
      $inc: { notifications: 1 },
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
  req.session.pageNum += 1;
  const lastBreet = req.session.lastBreet;
  const sessionUser = req.user;
  const users = await User.find({});
  const baseBreets = await Breet.find({
    $or: [
      {
        $and: [
          { username: sessionUser.username },
          { time: { $lt: req.session.lastBreet } },
        ],
      },
      {
        $and: [
          { username: { $in: sessionUser.following } },
          { time: { $lt: req.session.lastBreet } },
        ],
      },
    ],
  })
    .sort({ time: -1 })
    .limit(15)
    .populate("parent");
  const rebreets = await Rebreet.find({
    $or: [
      {
        $and: [
          { rebreeter: sessionUser.username },
          { time: { $lt: req.session.lastBreet } },
        ],
      },
      {
        $and: [
          { rebreeter: { $in: sessionUser.following } },
          { time: { $lt: req.session.lastBreet } },
        ],
      },
    ],
  })
    .sort({ time: -1 })
    .limit(20 - baseBreets.length)
    .populate("breet");
  const feed = [...baseBreets, ...rebreets].sort((a, b) => {
    return b.time - a.time;
  });
  let breets = [];
  for (let breet of feed) {
    if (breet.content) {
      breets.push(breet);
    } else {
      breets.push({ ...breet.breet._doc, rebreeter: breet.rebreeter });
    }
  }
  if (breets.length) {
    req.session.lastBreet = breets.findLast((e) => e.time).time;
  }
  res.json({ breets, sessionUser });
};
