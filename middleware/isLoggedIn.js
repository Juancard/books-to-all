'use strict';

let errors = require('http-verror');

module.exports = function(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    if (req.xhr)
      return res.json({
        message: {
          type: 'danger',
          text: 'Log in first to perform this action'
        }
      });
    res.redirect("/login");
  }
}
