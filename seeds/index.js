const mongoose = require("mongoose");
const Breet = require("../models/breets");
const User = require("../models/users");
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/breeta");
  console.log("connected");
}

usersSeed = [
  {
    dName: "Deansdale's Dean",
    pfp: "",
    bio: "A Good Dean",
    creationDate: 1676571079999,
    email: "Deanaling@Greendale.edu.com",
    username: "DeanMachine",
    password: "Iammy$ist3er",
    following: [],
    followers: [],
  },
  {
    dName: "Annie <3",
    pfp: "https://i.postimg.cc/rs35hmpF/maxresdefault-1.jpg",
    bio: "ANNIE'S GOT A GUN",
    creationDate: 1676571000000,
    email: "AnnieEdison@yahoo.com",
    username: "AdderallIsFun",
    password: "Idraw@3sxx",
    following: [],
    followers: [],
  },
  {
    dName: "AliceIsFreezing",
    pfp: "",
    bio: "Why yes I do have a favourite tv show",
    creationDate: 1626571074328,
    email: "Asif@gmail.com",
    username: "AliceLikesLadders",
    password: "Thalia@99",
    following: [],
    followers: [],
  },
];

breetsSeed = [
  {
    content: "Who wants olives?",
    dName: "Deansdale's Dean",
    username: "DeanMachine",
    time: 1676571074328,
    location: "Jeff's Apartment Building",
    image: "",
    likes: 0,
    replies: 0,
    rebreets: 0,
    parent: "",
    views: 0,
  },
  {
    content: "I can't find my pen!",
    dName: "Annie <3",
    username: "AdderallIsFun",
    time: 1676571074328,
    location: "Cafeteria",
    image: "",
    likes: 0,
    replies: 0,
    rebreets: 0,
    parent: "",
    views: 0,
  },
  {
    content: "This is a grown up pillow fort.",
    dName: "AliceIsFreezing",
    username: "AliceLikesLadders",
    time: 1676571074328,
    location: "Pillow Fort",
    image: "",
    likes: 0,
    replies: 0,
    rebreets: 0,
    parent: "",
    views: 0,
  },
];

const seedUser = async () => {
  await User.deleteMany({});
  for (let u of usersSeed) {
    const user = new User({
      dName: u.dName,
      pfp: u.pfp,
      bio: u.bio,
      creationDate: u.creationDate,
      username: u.username,
      password: u.password,
      following: u.following,
      followers: u.followers,
    });
    await user.save();
  }
};

const seedBreet = async () => {
  await Breet.deleteMany({});
  console.log("hi");
  async function findId(b) {
    const user = await User.findOne({ username: b.username });
    return user._id;
  }
  for (let b of breetsSeed) {
    const breet = new Breet({
      content: b.content,
      user: await findId(b),
      dName: b.dName,
      username: b.username,
      time: b.time,
      location: b.location,
      image: b.image,
      likes: b.likes,
      replies: b.replies,
      rebreets: b.rebreets,
      parent: b.parent,
      views: b.views,
    });
    await breet.save();
  }
};

async function seed() {
  await seedUser()
    .then(seedBreet)
    .then(() => {
      mongoose.connection.close();
    });
}

seed();
