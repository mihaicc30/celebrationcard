const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const {
	forwardAuthenticated,
	ensureAuthenticated,
} = require("../middleware/auth");
const Products = require("../model/Products");
const Baskets = require("../model/Baskets");

router.get("/products", ensureAuthenticated, async (req, res) => {
	
	try {
		const page = parseInt(req.query.page) || 0;
		const sorting =
			req.query.sortingBy == "Clear Sorting" ? "" : req.query.sortingBy;

		const count = await Products.countDocuments(
			sorting ? { cat: sorting } : {},
		);

		const cats = await Products.distinct("cat");

		const query = Products.find(sorting ? { cat: sorting } : {})
			.skip(page * 8)
			.limit(8);

		const results = await query.exec();

		
		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();
		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});

		res.render("products", {
			user: req.session.passport.user,
			products: results,
			sorting,
			page,
			count,
			cats,
			basketLength: totalItems,
		});
	} catch (err) {
		console.error(err);
	}
});

// add products page
router.post("/add", ensureAuthenticated, async function (req, res) {
	try {
		const { qty, productName } = req.body;
		await Baskets.create({ userID: req.session.passport.user.id, productName, qty });
		res.redirect(req.headers.referer);
	} catch (err) {
		console.error(err);
	}
});
// remove products page
router.post('/removeproduct', ensureAuthenticated, function (req, res) {
  var { productID, productName } = req.body;
  var removeFromBasket = Baskets.find({ _id: productID }).deleteOne().exec();
  console.log(`${productName} successfully deleted from your cart.`);
  res.redirect('basket');
});

module.exports = router;
