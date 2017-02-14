'use strict';

let errors = require('http-verror');

module.exports = function(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    if (req.xhr) return next(new errors.Unauthorized());
    res.redirect("/");
  }
}
