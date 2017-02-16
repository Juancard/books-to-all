'use strict';

module.exports = function (app, appEnv) {

  app.route('/api/user/:user_id([a-fA-F0-9]{24})')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
			res.json(req.user);
		});

  app.route('/profile')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
			res.render(appEnv.path + '/app/views/profile.pug', {message: "La cagaste"});
		});

  app.route('/profile/location')
    .post(appEnv.middleware.isLoggedIn, function (req, res) {
      console.log(req.body);
    });

  app.route('/profile/password')
    .post(appEnv.middleware.isLoggedIn, function (req, res) {
      console.log(req.body);
    });
}
