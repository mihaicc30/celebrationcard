const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Baskets = require('../models/Baskets');
const Products = require('../models/Products');
const Orders = require('../models/Orders');
const User = require('../models/User');

const dotenv = require('dotenv');
dotenv.config();
var db = process.env.mongoURI;
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


// products sorting page
router.get('/products', ensureAuthenticated, (req, res) => {
  switch (req.query["sortingBy"]) {
    case "Birthday":
      var queryz = Products.find({ cat: "Birthday" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "New Year":
      var queryz = Products.find({ cat: "New Year" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "Easter":
      var queryz = Products.find({ cat: "Easter" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "Christmas":
      var queryz = Products.find({ cat: "Christmas" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "For Her":
      var queryz = Products.find({ cat: "For Her" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "For Him":
      var queryz = Products.find({ cat: "For Him" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    case "Custom":
      var queryz = Products.find({ cat: "Custom" })
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
      break;
    default:
      var queryz = Products.find()
      queryz.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('products', {
          user: req.user,
          products: results
        })
      })
  }
})

// product manager page
router.post('/extraMessage', (req, res) => {//, ensureAuthenticated
  var queryz = Orders.updateOne({ _id: req.body.orderIDD },{$set:{ userMESSAGE: req.body.textarea }})
  queryz.exec(function (err, results) {
    if (err) return handleError(err);
    res.render('dashboard', {
      user: req.user,
      success_msg: "Your message has been successfully added! Thank you!"
    })
  })
})

// products page
router.get('/orders_manager', (req, res) => {//, ensureAuthenticated
  var queryz = Orders.find().sort({ date: -1 })
  queryz.exec(function (err, results) {
    if (err) return handleError(err);
    res.render('orders_manager', {
      user: req.user,
      orders: results
    })
  })

})

// orders_manager_delete page
router.post('/orders_manager_delete', (req, res) => {//, ensureAuthenticated
  var { orderID } = req.body
  if (req.path.includes("delete")) {
    var queryz = Orders.deleteOne({ _id: req.body.orderID }).exec()
    res.redirect('orders_manager')
  }
})
// orders_manager_markseen page
router.post('/orders_manager_markseen', (req, res) => {//, ensureAuthenticated
  var { orderID } = req.body
  if (req.path.includes("markseen")) {
    var queryz = Orders.updateOne({ _id: req.body.orderID },{$set:{adminSEEN:"2"}}).exec()
    res.redirect('orders_manager')
  }
})

// orders_manager_markseen page
router.post('/orders_manager_markunseen', (req, res) => {//, ensureAuthenticated
  var { orderID } = req.body
  if (req.path.includes("markunseen")) {
    var queryz = Orders.updateOne({ _id: req.body.orderID },{$set:{adminSEEN:"1"}}).exec()
    res.redirect('orders_manager')
  }
})

// orders_manager_update page
router.post('/orders_manager_update', (req, res) => {//, ensureAuthenticated

  var queryz = Orders.findByIdAndUpdate({ _id:req.body.orderID },{$set:{
        userTOTAL:req.body.userTOTAL, userNAME:req.body.userNAME, userEMAIL:req.body.userEMAIL,userADDRESS:req.body.userADDRESS,userMESSAGE:req.body.userMESSAGE,adminSEEN:req.body.adminSEEN
      }}).sort({ date: -1 })
  queryz.exec()
    res.redirect('orders_manager')

})


// complete order Page
router.get('/complete', ensureAuthenticated, (req, res) => {
  if (req.query['success']) {
    var queryz = Baskets.find({ userID: String(req.user._id).slice(0) })
    queryz.exec(function (err, results) {
      if (err) return handleError(err);
      if(results.length>0){

        var queryz2 = Products.find()
      queryz2.exec(function (err, results2) {
        if (err) return handleError(err);

        var total = 0;
        results.forEach(b => {
          results2.forEach(p => {
            if (p.name == b.productName) {
              (p.price * b.qty).toFixed(2);
              total += parseFloat((p.price * b.qty).toFixed(2))
            }
          });
        })
        var queryz3 = new Orders({ userTOTAL: total, userID: req.user._id, userNAME: req.user.name, userEMAIL: req.user.email, userADDRESS: req.user.address1 + "," + req.user.address2 + "," + req.user.city + "," + req.user.postcode, userORDER: { results } })
        queryz3.save(function (err, results3) {
          if (err) return console.log(err);

          var queryz4 = Baskets.deleteMany({ userID: req.user._id })
          queryz4.exec();

          res.render('complete', {
            user: req.user,
            basket: results,
            product: results2,
            orderID: results3._id
          })
        })
      })
      } else {
        res.render('complete', {
          user: req.user,
          basket: {},
          product: {},
          orderID: {}
        })
      }
    })
  }
})


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
router.post('/products', ensureAuthenticated, async (req, res) => { //
  var { userID } = req.body;

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
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 200,
                currency: 'gbp',
              },
              display_name: 'On custom orders',
              // Delivers in exactly 1 business day
              delivery_estimate: {
                maximum: {
                  unit: 'business_day',
                  value: 10,
                },
              }
            }
          },
        ],
        line_items: customerList,
        customer_email: req.user.email,
        mode: 'payment',
        payment_method_types: [
          "card"
        ],
        
        success_url: `${req.headers.origin}/complete?success=true`,
        cancel_url: `${req.headers.origin}/basket?canceled=true`,
      })
      res.redirect(303, session.url)
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  })
})

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
// // products page
// router.get('/products', ensureAuthenticated, (req, res) =>
//   mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
//     if (err) { console.log(err) } else {
//       db.collection("products").find().sort({ "price": 1 }).toArray(function (err, result) {
//         if (err) { console.log(err) } else {
//           res.render('products', {
//             user: req.user,
//             products: result
//           })
//         }
//       })
//     }
//   }))

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
router.get('/product_manager', (req, res) => {//, ensureAuthenticated
  var queryz = Products.find().sort({ name: 1 })
  queryz.exec(function (err, results) {
    if (err) return handleError(err);
    res.render('product_manager', {
      user: req.user,
      products: results
    })
  })
})

// post products manager page update
router.post('/product_manager1', (req, res) => {//, ensureAuthenticated
  var { product_id, name, price, img, cat } = req.body;
  var queryz = Products.updateOne({ _id: product_id }, { $set: { "name": name, "price": price, "img":img, "cat":cat } })
  var promise1 = new Promise((resolve, reject) => {
    queryz.exec(function (err, results) {
      if (err) return handleError(err);
      resolve(results)
    })
  })
  var queryz2 = Products.find().sort({ name: 1 })
  promise1.then(async (value) => {
    try {
      queryz2.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('product_manager', {
          user: req.user,
          products: results
        })
      })
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  })
})

// post products manager page insert
router.post('/product_manager2', (req, res) => {//, ensureAuthenticated
  var { name, price, img } = req.body;

  var queryz = Products.create({ "name": name, "price": price, "img": img })
  var promise1 = new Promise((resolve, reject) => {
    queryz.then(function (err, results) {
      resolve(results)
    })
  })
  var queryz2 = Products.find().sort({ name: 1 })
  promise1.then(async (value) => {
    try {
      queryz2.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('product_manager', {
          user: req.user,
          products: results
        })
      })
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  })
})

// post products manager page delete
router.post('/product_manager3', (req, res) => { //, ensureAuthenticated

  var { product_id } = req.body
  var queryz = Products.deleteOne({ _id: product_id })
  var promise1 = new Promise((resolve, reject) => {
    queryz.then(function (err, results) {
      resolve(results)
    })
  })
  var queryz2 = Products.find().sort({ name: 1 })
  promise1.then(async (value) => {
    try {
      queryz2.exec(function (err, results) {
        if (err) return handleError(err);
        res.render('product_manager', {
          user: req.user,
          products: results
        })
      })
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  })
})


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
router.post('/myprofile_update', ensureAuthenticated, (req, res) => {
  var { userid, name, email, password, address1, address2, city, postcode } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hashedPassword) => {
      passwordh = hashedPassword
      var queryz = User.updateOne({ _id: userid }, {
        $set: {
          "email": email, "name": name, "password": passwordh,
          "city": city, "address1": address1, "address2": address2, "postcode": postcode
        }
      })

      var promise1 = new Promise((resolve, reject) => {
        queryz.exec().then(function (err, results) {
          resolve(results)
        })
      })
      var queryz2 = User.find({ _id: userid })
      promise1.then(async (value) => {
        try {
          queryz2.exec(function (err, results) {
            if (err) return handleError(err);
            res.render('myprofile', {
              user: req.user,
              profile: results[0]
            })
          })
        } catch (err) {
          res.status(err.statusCode || 500).json(err.message);
        }
      })
    })
  })
})

// myprofile_delete page post
router.post('/myprofile_delete', ensureAuthenticated, (req, res) => {
  var { userid } = req.body;
  User.deleteOne({ _id: userid }).exec().then(
    req.flash('success_msg', `Account successfully deleted.`),
    res.redirect('dashboard'))
})
module.exports = router;
