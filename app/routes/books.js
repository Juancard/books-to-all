'use strict';

module.exports = function (app, appEnv) {

  app.route('/mybooks')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      next(new appEnv.errors.NotImplemented());
    });

  app.route('/allbooks')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      next(new appEnv.errors.NotImplemented());
    });

}
