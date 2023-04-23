const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const {
	forwardAuthenticated,
	ensureAuthenticated,
} = require("../middleware/auth");

const Products = require("../model/Products");
const Baskets = require("../model/Baskets");
const Orders = require("../model/Orders");

router.get("/basket", ensureAuthenticated, async (req, res) => {
	try {
		const productDetails = await Products.find().lean();
		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();
		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});

		res.render("basket", {
			user: req.session.passport.user,
			basket,
			productDetails,
			basketLength: totalItems,
		});
	} catch (err) {
		console.error(err);
		res.redirect("/");
	}
});
router.post("/basket", ensureAuthenticated, async (req, res) => {
	try {
		const basketContents = await Baskets.find({
			userID: String(req.session.passport.user.id).slice(0),
		}).lean();

		if (basketContents.length > 0) {
			const productList = await Products.find().lean();
			let total = 0;

			basketContents.forEach((basketItem) => {
				productList.forEach((product) => {
					if (product.name == basketItem.productName) {
						total += parseFloat((product.price * basketItem.qty).toFixed(2));
					}
				});
			});

			const orderDetails = {
				userTOTAL: total.toFixed(2),
				userID: req.session.passport.user.id,
				userNAME: req.session.passport.user.name,
				userEMAIL: req.session.passport.user.email,
				userADDRESS: req.session.passport.user.address,
				userORDER: basketContents,
			};

			const order = new Orders(orderDetails);
			await order.save();
			await Baskets.deleteMany({ userID: req.session.passport.user.id });

			const productDetails = await Products.find().lean();
			const basket = await Baskets.find({
				userID: req.session.passport.user.id,
			}).lean();

			res.render("basket", {
				user: req.session.passport.user,
				basket,
				productDetails,
				success_msg:
					"Your order is in! Shippment will be made as soon as possible.🌟",
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

module.exports = router;
