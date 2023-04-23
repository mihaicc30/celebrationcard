const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const Baskets = require("../model/Baskets");
const Orders = require("../model/Orders");
const Contacts = require("../model/Contacts");
const Products = require("../model/Products");
const {
	forwardAuthenticated,
	ensureAuthenticated,
	ensureIsAdmin,
} = require("../middleware/auth");

//  adminSEEN: '1' = unseen / unprocessed
//  adminSEEN: '2' = seen / processed

router.get("/adminDash", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	const [
		orders,
		newOrders,
		doneOrders,
		contacts,
		newContacts,
		doneContacts,
		products,
	] = await Promise.all([
		Orders.find().sort({ date: -1 }).lean(),
		Orders.find({ adminSEEN: 1 }).lean(),
		Orders.find({ adminSEEN: 2 }).lean(),
		Contacts.find().sort({ date: -1 }).lean(),
		Contacts.find({ adminSEEN: 1 }).lean(),
		Contacts.find({ adminSEEN: 2 }).lean(),
		Products.find().lean(),
	]);

	res.render("adminDash", {
		user: req.session.passport.user,
		orders,
		newOrders: newOrders.length,
		doneOrders: doneOrders.length,
		contacts,
		newContacts: newContacts.length,
		doneContacts: doneContacts.length,
		products,
	});
});

router.get("/adminOrders", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	try {
		const orders = await Orders.find().sort({ date: -1 }).lean();

		res.render("adminOrders", {
			user: req.session.passport.user,
			orders: orders,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error");
	}
});

router.get("/adminMessages", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	try {
		const messages = await Contacts.find().sort({ date: -1 }).lean();

		res.render("adminMessages", {
			user: req.session.passport.user,
			messages: messages,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error");
	}
});

router.get("/adminProducts", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	try {
		const products = await Products.find().sort({ date: -1 }).lean();

		res.render("adminProducts", {
			user: req.session.passport.user,
			products: products,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error");
	}
});

router.post("/adminProducts", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	if (req.url.includes("delete")) {
		await Products.deleteOne({ _id: req.body.productID });
		const products = await Products.find().sort({ date: -1 }).lean();
		res.render("adminProducts", {
			user: req.session.passport.user,
			products: products,
			message: "Product has been deleted.",
		});
	}
});

const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const upload = multer({ dest: "./public/img" });
router.post(
	"/adminProductsUp",
	ensureAuthenticated, ensureIsAdmin,
	upload.single("myfile"),
	async (req, res) => {
		if (req.url.includes("edit")) {
			let fileName = crypto.randomUUID()

			if(req.file){
				if (!fs.existsSync("./public/img")) {
					fs.mkdirSync("./public/img");
				}
				await sharp(req.file.path)
				.toFile(`./public/img/${fileName}.jpg`)
			
				fs.unlink(req.file.path, (err) => {
					if (err) console.log(err);
				});
			}

			let isImage = req.file ? `./img/${fileName}.jpg` : req.body.currentImg

			await Products.updateOne({ _id: req.body.pid }, { $set: { "name": req.body.name, "price": req.body.price, "img":isImage, "cat":req.body.cat } })

			//   await Products.deleteOne({ _id: req.body.productID });
			const products = await Products.find().sort({ date: -1 }).lean();
			res.render("adminProducts", {
				user: req.session.passport.user,
				products: products,
				message: "Product has been updated.",
			});
		}
		
		if (req.url.includes("add")) {
			let fileName = crypto.randomUUID()

			if(req.file){
				if (!fs.existsSync("./public/img")) {
					fs.mkdirSync("./public/img");
				}
				await sharp(req.file.path)
				.toFile(`./public/img/${fileName}.jpg`)
			
				fs.unlink(req.file.path, (err) => {
					if (err) console.log(err);
				});
			}

			let isImage = req.file ? `./img/${fileName}.jpg` : ""

			await Products.create({ "name": req.body.name, "price": req.body.price, "img":isImage, "cat":req.body.cat  })

			const products = await Products.find().sort({ date: -1 }).lean();
			res.render("adminProducts", {
				user: req.session.passport.user,
				products: products,
				message: "Product has been updated.",
			});
		}
	},
);

router.post("/orders_manager_delete", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	const { orderID } = req.body;

	if (req.path.includes("delete")) {
		try {
			await Orders.deleteOne({ _id: orderID }).exec();

			const orders = await Orders.find().sort({ date: -1 }).lean();
			res.render("adminOrders", {
				user: req.session.passport.user,
				orders: orders,
			});
		} catch (error) {
			console.error(error);
			res.status(500).send("Server Error");
		}
	}
});

router.post(
	"/orders_manager_markseen",
	ensureAuthenticated, ensureIsAdmin,
	async (req, res) => {
		const { orderID } = req.body;
		if (req.path.includes("markseen")) {
			try {
				const order = await Orders.findOne({ _id: orderID });
				if (!order) {
					return res.status(404).send("Order not found");
				}
				const adminSEEN = order.adminSEEN === "1" ? "2" : "1";
				await Orders.updateOne({ _id: orderID }, { $set: { adminSEEN } });

				const orders = await Orders.find().sort({ date: -1 }).lean();
				res.render("adminOrders", {
					user: req.session.passport.user,
					orders: orders,
				});
			} catch (error) {
				console.error(error);
				res.status(500).send("Server Error");
			}
		}
	},
);
router.post("/messages_markseen", ensureAuthenticated, ensureIsAdmin, async (req, res) => {
	const { orderID } = req.body;
	if (req.path.includes("markseen")) {
		try {
			const message = await Contacts.findOne({ _id: orderID });
			if (!message) {
				return res.status(404).send("Message not found");
			}
			const adminSEEN = message.adminSEEN === "1" ? "2" : "1";
			await Contacts.updateOne({ _id: orderID }, { $set: { adminSEEN } });

			const messages = await Contacts.find().sort({ date: -1 }).lean();
			res.render("adminMessages", {
				user: req.session.passport.user,
				messages: messages,
			});
		} catch (error) {
			console.error(error);
			res.status(500).send("Server Error");
		}
	}
});

module.exports = router;
