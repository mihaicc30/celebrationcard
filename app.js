const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("cookie-session");
const app = express();
const dotenv = require("dotenv").config();
const multer = require("multer");
const flash = require("connect-flash");

require("./middleware/passport")(passport);

mongoose
	.connect(`${process.env.mongoURI}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connection successfully made."))
	.catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(
	session({
		secret: `${process.env.SESSION_SECRET}`,
		resave: false,
		saveUninitialized: false,
		maxAge: 1 * 60 * 60 * 1000, // 1 hour, a number represented in milliseconds
	}),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(express.static("view"));
app.use(express.static("route"));

app.use("/", require(__dirname+"/route/index.js"));
app.use("/", require(__dirname+"/route/products.js"));
app.use("/", require(__dirname+"/route/contact.js"));
app.use("/", require(__dirname+"/route/basket.js"));
app.use("/", require(__dirname+"/route/profile.js"));
app.use("/", require(__dirname+"/route/userManagement.js"));
app.use("/", require(__dirname+"/route/admin.js"));

app.set("views", __dirname + "/view");

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
});

app.all("*", (req, res) => {
	console.log(
		"The requested page was not found. You are being redirected to the homepage.",
	);
	res.redirect("/");
});
app.listen(8080, '0.0.0.0', () => console.log('Server is running on port 8080.'));

