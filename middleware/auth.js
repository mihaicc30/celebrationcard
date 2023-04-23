module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.render('Login', {error:"Please log in to view this page."});
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');      
    }
  };
  