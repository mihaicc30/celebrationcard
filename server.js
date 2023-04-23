const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('cookie-session');
const app = express();
const dotenv = require('dotenv').config();
const multer = require('multer');
const flash = require('connect-flash');

require('./middleware/passport')(passport);

mongoose.connect(process.env.mongoURI,{   
  useNewUrlParser: true,
  useUnifiedTopology: true})
  .then(() => console.log('MongoDB connection successfully made.'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    maxAge: 1 * 60 * 60 * 1000 // 1 hour, a number represented in milliseconds
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
app.use(express.static('view'));
app.use(express.static('route'));

app.use('/', require('./route/index.js'));
app.use('/', require('./route/products.js'));
app.use('/', require('./route/contact.js'));
app.use('/', require('./route/basket.js'));
app.use('/', require('./route/profile.js'));
app.use('/', require('./route/userManagement.js'));
app.use('/', require('./route/admin.js'));

app.set('views', __dirname + '/view');

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
});
  
const port = process.env.PORT || 8080
app.listen(port, console.log(`Server running on ${port}`));