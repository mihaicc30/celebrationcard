const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const Baskets = require("../model/Baskets");
const fs = require('fs');
const Products = require("../model/Products");

router.get("/", async (req, res) => {
	const query = Products.find({}).limit(2)
	const results = await query.exec();
	console.log(results);

	if (req.isAuthenticated()) {
		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();
		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});

		res.render("index", {
			user: req.session.passport.user,
			basketLength: totalItems,
		});
	} else {
		res.render("index");
	}
});

router.get("/index", async (req, res) => {
	if (req.isAuthenticated()) {
		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();
		res.render("index", {
			user: req.session.passport.user,
			basketLength: basket.length,
		});
	} else {
		res.render("index");
	}
});

module.exports = router;
