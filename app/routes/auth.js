'use strict';


module.exports = function (app, appEnv) {

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });
  app.route('/login')
      .get(function (req, res) {
        let out = {
          message: req.flash('loginMessage')
        };
        res.render(appEnv.path + '/app/views/pages/user/login.pug', out);
      })
      .post(appEnv.passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
      }));
  app.route('/signup')
      .get(function(req, res) {
        let out = {
          message: req.flash('signupMessage')
        };
        res.render(appEnv.path + '/app/views/pages/user/signup.pug', out);
      })
      .post(appEnv.passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: "/signup",
            failureFlash : true // allow flash messages
          }));
}
