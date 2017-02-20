'use strict';

module.exports = function (app, appEnv) {

  let UserHandler = require('../controllers/userHandler.server.js')
  let userHandler = new UserHandler();

  app.route('/api/user/:user_id([a-fA-F0-9]{24})')
		.get(appEnv.middleware.isLoggedIn, function (req, res) {
			res.json(req.user);
		});

  app.route('/profile')
		.get(appEnv.middleware.isLoggedIn, function (req, res, next) {
      userHandler.getLocation(req.user, (err, result) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err, "Error in getting user location"
            )
          );
        let out = {
          location: result
        };
        res.render(appEnv.path + '/app/views/profile.pug', out);
      })
		});

  app.route('/profile/location')
    .post(appEnv.middleware.isLoggedIn, function (req, res, next) {
      userHandler.updateLocation(req.user, req.body.city, req.body.state, (err, result) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err, "Error in updating user location"
            )
          );
        res.json({
          message: {
            type: 'success',
            text: 'Updated!'
          }
        })
      })
    });

  app.route('/profile/password')
    .post(appEnv.middleware.isLoggedIn, function (req, res, next) {
      userHandler.updatePassword(req.user,
        req.body.currentPassword, req.body.newPassword,
        (err, result) => {
          res.json({
            message: {
              type: (err)? 'danger' : 'success',
              text: (err)? err.message : 'Updated!'
            }
          });
      });
    });
}
