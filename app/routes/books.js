'use strict';

module.exports = function (app, appEnv) {

  app.route('/mybooks')
    .get(appEnv.middleware.isLoggedIn, function (req, res) {
      res.json({message: 'in mybooks page'});
    });

  app.route('/allbooks')
    .get(appEnv.middleware.isLoggedIn, function (req, res) {
      res.json({message: 'in allbooks page'});
    });

}
