const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
const cors = require("cors")
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

//passport config
require('./config/passport')(passport);
const db = require('./config/keys').mongoURI;

//MongoDB test connection
mongoose.connect(db,{ useNewUrlParser: true ,useUnifiedTopology: true})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


//ejs config
app.use(expressLayouts);
app.set('view engine', 'ejs');
// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 't34tg4gh6675ik6f232d32f45yg56uh4j6',
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours, a number representing the milliseconds from Date.now() for expiry
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());
// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/config', express.static('./config'));
app.use('/pictures', express.static('./pictures'));


app.all('*', (req, res) => {
  res.render("./page_not_found.ejs")
})

const PORT = process.env.PORT || 4444;
app.listen(PORT, console.log(`Server running on ${PORT}`));

// http://localhost:4444