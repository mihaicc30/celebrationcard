const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const {
	forwardAuthenticated,
	ensureAuthenticated,
} = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const Orders = require("../model/Orders");
const User = require("../model/User");
const Baskets = require("../model/Baskets");

router.get("/Profile", ensureAuthenticated, async (req, res) => {
	try {
		const orders = await Orders.find({ userID: req.user._id }).sort({
			date: -1,
		});

		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();

		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});

		res.render("profile", {
			user: req.session.passport.user,
			orders: orders,
			basketLength: totalItems,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.post("/Profile", ensureAuthenticated, async (req, res) => {
	const { name, email, password, address } = req.body;

	try {
		const salt = await bcrypt.genSalt(10);
		const passwordh = await bcrypt.hash(password, salt);

		await User.updateOne(
			{ _id: req.session.passport.user.id },
			{
				$set: {
					email: email,
					name: name,
					password: passwordh,
					address: address,
				},
			},
		);

		const results = await User.find({
			_id: req.session.passport.user.id,
		}).exec();

		req.session.passport.user = {
			id: req.session.passport.user.id,
			name: name,
			email: email,
			address: address,
		};

		const orders = await Orders.find({ userID: req.user._id }).sort({
			date: -1,
		});

		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();

		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});


		res.render("profile", {
			user: req.session.passport.user,
			orders: orders,
			success_msg: "Profile successfully updated!",
			basketLength: totalItems,
		});
	} catch (err) {
		res.status(err.statusCode || 500).json(err.message);
	}
});

module.exports = router;
