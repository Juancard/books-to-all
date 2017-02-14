'use strict';

module.exports = (err, req, res, next) => {
  res.status(err.statusCode || 500);
  let out = {
    error: err,
    developer: process.env.NODE_ENV
  }
  res.render(process.cwd() + '/app/views/error.pug', out);
}
