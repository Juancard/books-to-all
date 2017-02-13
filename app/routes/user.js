'use strict';

module.exports = function (app, appEnv) {

  app.route('/api/user/:user_id([a-fA-F0-9]{24})')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
			res.json(req.user);
		});

}
