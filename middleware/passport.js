const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../model/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            console.log("The user with that email address does not exist.");
            return done(null, false, { message: "The user with that email address does not exist." } );
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              console.log("Wrong password for this user.");
              return done(null, false, { message:"Wrong password for this user." } );
            }
          });
        })
        .catch(err => done(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, {"id":user.id, "name":user.name, "email":user.email, "address":user.address});
  });

  passport.deserializeUser(async(id, done) => {
    try {
      const user = await User.findById(id["id"]);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};