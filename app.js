const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("cookie-session");
const app = express();
const dotenv = require("dotenv").config();
const multer = require("multer");
const flash = require("connect-flash");
const path = require("path");

require("./middleware/passport")(passport);

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

mongoose.set("strictQuery", false);

app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(
	session({
		secret: `${process.env.SESSION_SECRET}`,
		keys:`${process.env.SESSION_SECRET}`,
		resave: false,
		saveUninitialized: false,
		maxAge: 1 * 60 * 60 * 1000, // 1 hour, a number represented in milliseconds
	}),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "view")));
app.use(express.static(path.join(__dirname, "route")));

app.get("/healthcheck", (req, res) => {
	res.status(200).send("OK");
});

app.use("/", require(path.join(__dirname, "/route/index.js")));
app.use("/", require(path.join(__dirname, "/route/products.js")));
app.use("/", require(path.join(__dirname, "/route/contact.js")));
app.use("/", require(path.join(__dirname, "/route/basket.js")));
app.use("/", require(path.join(__dirname, "/route/profile.js")));
app.use("/", require(path.join(__dirname, "/route/userManagement.js")));
app.use("/", require(path.join(__dirname, "/route/admin.js")));

app.set("views", __dirname + "/view");
app.set("routes", __dirname + "/route");
app.set("public", __dirname + "/public");

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
});

app.all("*", (req, res) => {
	console.log(
		"The requested page was not found. You are being redirected to the homepage.",
	);
	res.redirect("/");
});

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
	app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
});
