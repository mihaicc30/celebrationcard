const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { Double } = require('mongodb');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const db = require('../config/keys').mongoURI;
var ObjectId = require('mongodb').ObjectID;
const Baskets = require('../models/Baskets');

const dotenv = require('dotenv');
const { resolveContent } = require('nodemailer/lib/shared');
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


// remove products page
router.post('/removeproduct', ensureAuthenticated, function (req, res) {
  var { productID, productName } = req.body;
  var removeFromBasket = Baskets.find({ _id: productID }).deleteOne().exec();
  req.flash('error', `${productName} successfully deleted from your cart.`);
  res.redirect('basket');
});

// add products page
router.post('/add', ensureAuthenticated, function (req, res) {
  var { qty, user, productName } = req.body;

  var newBasket = new Baskets({ userID: user, productName: productName, qty: qty })
  newBasket.save(function (err, res) {
    if (err) return console.error(err);
  })
  req.flash('success_msg', `${productName} x ${qty} is added to cart.`);
  res.redirect('products');
});

// products submit page
router.post('/products', ensureAuthenticated, async (req, res) => { //, ensureAuthenticated
  var { userID } = req.body;
  // console.log(userID);

  const promise1 = new Promise((resolve, reject) => {
    mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
      if (err) { console.log(err) } else {
        contents = [];
        db.collection("baskets").find({ userID: userID }).toArray(function async(err, basketContents) {
          db.collection("products").find().toArray(function async(err, productList) {
            counter = 0;
            basketContents.forEach(item => {
              productList.forEach(product => {
                if (item.productName == product.name) {
                  contents.push([product.name, item.qty, (product.price * 100).toFixed()]);
                }
              });
            })
            resolve(contents);
          });
        });
      }
    })
  })
  promise1.then(async (value) => {
    try {
      const customerList = value.map((product, i) => {
        return {
          price_data: {
            currency: "GBP",
            unit_amount: parseInt(product[2], 10),
            product_data: { name: product[0], },
          },
          quantity: product[1],
        };
      });
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: customerList,
        customer_email: req.user.email,
        mode: 'payment',
        payment_method_types: [
          "card"
        ],
        success_url: `${req.headers.origin}/basket/?success=true`,
        cancel_url: `${req.headers.origin}/basket/?canceled=true`,
      })
      res.redirect(303, session.url)
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  })
})


// if (req.method === 'POST') {
// console.log("STRIPE POST REQUEST");

// try {
//   // Create Checkout Sessions from body params.
//   const session = await stripe.checkout.sessions.create({

//     line_items: [
//       //need a loop

//       {
//         price_data: {
//           currency: "gbp",
//           unit_amount: 333,
//           product_data: {
//             name: name,
//           },
//         },
//         quantity: qty,
//       }
//     ],
//     customer_email: email,
//     mode: 'payment',
//     payment_method_types: [
//       "card"
//     ],
//     success_url: `${req.headers.origin}/products/?success=true`,
//     cancel_url: `${req.headers.origin}/products/?canceled=true`,
//   })
//   res.redirect(303, session.url)
// } catch (err) {
//   res.status(err.statusCode || 500).json(err.message);
// } }
// })


// basket Page
router.get('/basket', ensureAuthenticated, (req, res) => {
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) { console.log(err) } else {
      var productDetails;
      db.collection("products").find().toArray(function (err, result) {
        productDetails = result

        db.collection("baskets").find({ userID: String(req.user._id).slice(0) }).toArray(function (err, result) {
          if (err) { console.log(err) } else {
            res.render('basket', {
              user: req.user,
              basket: result,
              productDetails: productDetails
            })
          }
        })
      })
    }
  }).close
})



// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('dashboard')
})




// Dashboard
router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    user: req.user
  })

});

// Contact page
router.get('/contact', (req, res) => //, ensureAuthenticated
  res.render('contact', {
    user: req.user
  })
);
// products page
router.get('/products', ensureAuthenticated, (req, res) =>
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) { console.log(err) } else {
      db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('products', {
            user: req.user,
            products: result
          })
        }
      })
    }
  }))

// Contact post page
router.post('/contact', (req, res) =>
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { name, email, message } = req.body;
    if (err) { console.log(err) } else {
      db.collection("contacts").insertOne({
        "name": name,
        "email": email,
        "message": message
      });
      res.render('contact', {
        user: req.user,
        success_msg: "Your message has been successfully sent! Thank you!"
      })

    }
  }))


// product manager page
router.get('/product_manager', (req, res) => //, ensureAuthenticated

  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) { console.log(err) } else {
      db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('product_manager', {
            user: req.user,
            products: result
          })
        }
      })
    }
  }).close)

// post products manager page update
router.post('/product_manager1', (req, res) => //, ensureAuthenticated

  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { product_id, name, price, photo } = req.body;
    if (err) { console.log(err) } else {
      delete req.body._id;
      db.collection("products").updateOne({ _id: new ObjectId(product_id) }, { $set: { "price": price, "name": name, "photo": photo } });  // yes i know its deprecated!!! but still works! :D

      db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('product_manager', {
            user: req.user,
            products: result,
            success_msg: "Product updated!"
          })
        }
      })
    }
  }).close
)
// post products manager page insert
router.post('/product_manager2', (req, res) => //, ensureAuthenticated

  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { product_id, name, price, photo } = req.body;
    if (err) { console.log(err) } else {

      db.collection("products").insertOne({ "price": Double(price), "name": name, "photo": photo });

      db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('product_manager', {
            user: req.user,
            products: result,
            success_msg: "Product updated!"
          })
        }
      })
    }
  })
)
// post products manager page delete
router.post('/product_manager3', (req, res) => //, ensureAuthenticated

  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { product_id, name, price } = req.body;
    if (err) { console.log(err) } else {

      db.collection("products").deleteOne({ _id: new ObjectId(product_id) });

      db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('product_manager', {
            user: req.user,
            products: result,
            success_msg: "Product updated!"
          })
        }
      })
    }
  }).close
)

// products page
router.get('/orders_manager', (req, res) => //, ensureAuthenticated

  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) { console.log(err) } else {
      db.collection("orders").find().toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('orders_manager', {
            user: req.user,
            orders: result
          })
        }

      })
    }
  }).close)

// my profile page get
router.get('/myprofile', ensureAuthenticated, (req, res) => //, ensureAuthenticated
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) { console.log(err) } else {
      db.collection("users").find({ "email": req.user.email }).toArray(function (err, result) {
        if (err) { console.log(err) } else {
          res.render('myprofile', {
            user: req.user,
            profile: result[0]
          })
        }

      })
    }
  }).close)
// myprofile_update page post
router.post('/myprofile_update', ensureAuthenticated, (req, res) =>
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { userid, name, email, password } = req.body;
    if (err) { console.log(err) } else {

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hashedPassword) => {
          password = hashedPassword;
          db.collection("users").updateOne({ _id: new ObjectId(userid) }, { $set: { "email": email, "name": name, "password": hashedPassword } }).then(
            db.collection("users").find({ "email": req.user.email }).toArray(function (er, result) {
              if (err) { console.log(err) } else {
                res.render('myprofile', {
                  user: req.user,
                  profile: result[0]
                })
              }
            })
          )
        })
      })
    }
  }))
// myprofile_delete page post
router.post('/myprofile_delete', ensureAuthenticated, (req, res) =>
  mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    var { userid } = req.body;
    if (err) { console.log(err) } else {
      db.collection("users").deleteOne({ _id: new ObjectId(userid) }).then(
        req.flash('success', 'Your account has been successfully deleted.'),
        res.redirect('dashboard'))
    }
  }))
module.exports = router;
