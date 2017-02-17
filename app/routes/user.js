'use strict';

module.exports = function (app, appEnv) {

  let UserHandler = require('../controllers/userHandler.server.js')
  let userHandler = new UserHandler();

  app.route('/api/user/:user_id([a-fA-F0-9]{24})')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
			res.json(req.user);
		});

  app.route('/profile')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
      userHandler.getLocation(req.user, (err, result) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err, "Error in getting user location: "
            )
          );
        result.message = req.flash('locationMessage')[0];
        let out = {
          location: result
        };
        res.render(appEnv.path + '/app/views/profile.pug', out);
      })
		});

  app.route('/profile/location')
    .post(appEnv.middleware.isLoggedIn, function (req, res) {
      console.log("entre a /profile/location", req.body);
      userHandler.updateLocation(req.user, req.body.city, req.body.state, (err, result) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err, "Error in updating user location: "
            )
          );
        req.flash('locationMessage', {
          type: 'success',
          value: 'Updated!'
        })
        res.redirect('/profile')
      })
    });

  app.route('/profile/password')
    .post(appEnv.middleware.isLoggedIn, function (req, res) {
      console.log(req.body);
    });
}
