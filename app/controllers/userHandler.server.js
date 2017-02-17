'use strict';

var User = require('../models/users.js');
var http_verror = require('http-verror');

function userHandler () {
  this.updateLocation = (user, city, state, callback) => {
    User.update(
      { _id: user.id },
      { $set: {
          'local.city': city,
          'local.state': state
        }
      },
      callback);
  },
  this.getLocation = (user, callback) => {
    User
      .findById(user.id)
      .exec( (err, userData) => {
        if (err)
          return new http_verror.InternalError(
            "Could not retrieve user by Id"
          );
        let out = {
          city: userData.local.city,
          state: userData.local.state
        }
        return callback(false, out);
      })
  },

  this.updatePassword = (user, currentPassword, newPassword, callback) => {
    User
      .findById(user.id)
      .exec( (err, userData) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              "Could not retrieve user by Id"
            )
          );
        if (!userData.validPassword(currentPassword))
          return callback(
            new http_verror.Unauthorized(
              "Password is not valid"
            )
          );
        userData.local.password = userData.generateHash(newPassword);
        userData.save( (err, result) => {
          if (err)
            return callback(
              new http_verror.InternalError(
                "Could not save new user password"
              )
            );
          return callback(false, result);
        });
      })
  }
}

module.exports = userHandler;
