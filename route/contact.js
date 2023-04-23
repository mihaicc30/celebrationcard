const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const Contacts = require("../model/Contacts");
const Baskets = require("../model/Baskets");

router.get("/contact", async(req, res) => {
	if (req.session.passport?.user) {
		const basket = await Baskets.find({
			userID: req.session.passport.user.id,
		}).lean();
		let totalItems = 0;
		basket.forEach((item) => {
			totalItems += parseInt(item.qty);
		});

		res.render("contact", {
			user: req.session.passport.user,
			basketLength: totalItems,
		});
	} else {
		res.render("contact");
	}
});
// Contact post page
router.post('/contact', async (req, res) => {
	try {
	  const { name, email, message } = req.body;
	  const query = new Contacts({ name, email, message });
	  await query.save();
	  req.session.passport
		? res.render("contact", { user: req.session.passport.user, success_msg: "Your message has been successfully sent! Thank you!"})
		: res.render("contact", {success_msg: "Your message has been successfully sent! Thank you!"});
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  });
  


module.exports = router;
