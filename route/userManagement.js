const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require('connect-flash');

async function forwardAuthenticated(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
}

async function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.render("login", { error: "Please log in to view this page." });
}


// const {
// 	forwardAuthenticated,
// 	ensureAuthenticated,
// } = require("../middleware/auth");

const User = require("../model/User");

router.get("/register", forwardAuthenticated, (req, res) => {
	res.render("register");
});

router.get("/login", forwardAuthenticated, (req, res) => {
	res.locals.message = req.flash('error');
	String(req.url).indexOf("registration=true") >= 0 ? res.render("login",{reg:true}) : res.render("login")
});

// Register
router.post("/register", (req, res) => {
	const { name, email, password, passwordRepeat } = req.body;
	let errors = [];

	if (!name || !email || !password || !passwordRepeat) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (password != passwordRepeat) {
		errors.push({ msg: "Passwords do not match" });
	}

	if (password.length < 6) {
		errors.push({ msg: "Password must be at least 6 characters" });
	}

	if (errors.length > 0) {
		res.render("register", {
			errors,
			name,
			email,
			password,
			passwordRepeat,
		});
	} else {
		User.findOne({ email: email }).then((user) => {
			if (user) {
				errors.push({ msg: "Email already exists!" });
				res.render("register", {
					errors,
					name,
					email,
					password,
					passwordRepeat,
				});
			} else {
				const newUser = new User({
					name,
					email,
					password,
				});

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then((user) => {
								res.redirect("/login?registration=true");
							})
							.catch((err) => console.log(err));
					});
				});
			}
		});
	}
});

// Login
router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		failureRedirect: "/login",
		successRedirect: "/",
		failureFlash: true,
	})(req, res, next);
});

// Logout
router.get("/logout", ensureAuthenticated, (req, res) => {
	req.logout();
	console.log("User has been logged out");
	res.redirect("/");
});

module.exports = router;
