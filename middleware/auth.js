module.exports = {
	ensureIsAdmin: function (req, res, next) {
		if (req.isAuthenticated()) {
			if (
				req.session.passport.user.email == process.env.ADMIN_EMAIL &&
				req.session.passport.user.id == process.env.ADMIN_ID
			) {
				return next();
			}
		}
		res.render("Login", { error: "You dont have the permission for that." });
	},
	ensureAuthenticated: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.render("Login", { error: "Please log in to view this page." });
	},
	forwardAuthenticated: function (req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		res.redirect("/");
	},
};
