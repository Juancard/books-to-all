'use strict';

module.exports = (err, req, res, next) => {
  res.status(err.statusCode || 500);
  console.log(process.env.NODE_ENV);
  let out = {
    error: err,
    developer: process.env.NODE_ENV
  }
  if (req.xhr) {
    res.json(out)
  }else {
    res.render(process.cwd() + '/app/views/error.pug', out);
  }
}
