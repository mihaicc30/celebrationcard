module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        console.log("ensureAuthenticated >> User is auth >> Show Page");
        return next();
      }
      console.log("ensureAuthenticated >> User is not auth  >> Show Login");
      res.render('Login', {error:"Please log in to view this page."});
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        console.log("forwardAuthenticated >> User is not auth >> Show Page");
        return next();
      }
      console.log("forwardAuthenticated >> User is auth  >> Show Landing");
      res.redirect('/');      
    }
  };
  