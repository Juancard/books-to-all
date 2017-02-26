'use strict';

module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500);
  let out = {
    error: err,
    developer: process.env.NODE_ENV == 'development'
  }
  if (req.xhr) {
    res.json(err)
  }else {
    res.render(process.cwd() + '/app/views/pages/error.pug', out);
  }
}
