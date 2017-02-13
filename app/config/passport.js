'use strict';

var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use("local-signup", new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
			console.log("en local signup passport");
			User.findOne({ 'local.email' :  email }, function(err, user) {
	      // if there are any errors, return the error
	      if (err) return done(err);
	      // check to see if theres already a user with that email
	      if (user) {
	          return done(null, false, req.flash('signupMessage', 'The email already exists.'));
	      } else {
					let newUser = User.newInstance('local',
					req.body.displayName, email, password);
          // save the user
          newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
          });
        }
      });
    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use("local-login", new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, req.flash('loginMessage', 'Incorrect User.'));
        if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Incorrect Password.'));
        return done(null, user);
      });
    });
  }));
};
