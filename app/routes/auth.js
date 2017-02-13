'use strict';


module.exports = function (app, appEnv) {

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });
  app.route('/login')
      .get(function (req, res) {
        res.render(appEnv.path + '/app/views/login.pug');
      })
      .post(appEnv.passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
      }));
  app.route('/signup')
      .get(function(req, res) {
        res.render(appEnv.path + '/app/views/signup.pug');
      })
      .post(appEnv.passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: "/signup",
            failureFlash : true // allow flash messages
          }));
}
