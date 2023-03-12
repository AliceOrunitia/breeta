if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const AppError = require("./appError");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const User = require("./models/users");
const MongoDBStore = require("connect-mongo");

//Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");

//Mongo Atlas Account
const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://127.0.0.1:27017/breeta";

//Routers
const breetaRoutes = require("./routes/breeta");
const userRoutes = require("./routes/users");

// Mongoose Booter
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to breeta");
}

// Express options
const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("./views/layout"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(mongoSanitize());

// Session Store Config
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("Session store error");
});

// Session Configuration
const sessionConfig = {
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

const fontSrcUrls = [  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/",];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      // connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/breeta/",
        "https://i.pinimg.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
    crossOriginEmbedderPolicy: false,
  })
);

// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//session storage config
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//~~ROADMAP~~
// Set up password recovery/update
// build edit tweet properly -longer term build with edited icon and version history
// Add some personality
// Create git repository and upload to github
// Deploy on render

app.get("/", (req, res) => {
  res.render("./home");
});

//Routes
app.use("/breeta", breetaRoutes);
app.use("/users", userRoutes);

// 404 Response
app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

// // General Error Handling
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oopsie Woopsie, Something is brokey woken!";
  res.status(status).render("./breeta/error", { err });
});

app.listen(3005, () => console.log("port 3005"));
