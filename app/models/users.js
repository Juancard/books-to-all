'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');


var User = new Schema({
	local: {
		displayName: {
			type: String,
		},
		email: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		city: String,
		state: String
	}
});

// methods ======================
// generating a hash
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

User.statics
  .newInstance = function newInstance(strategy, displayName,
		email, password) {
  let newUser = new this();

	newUser[strategy].displayName = displayName;
	newUser[strategy].email = email;
	newUser[strategy].password = newUser.generateHash(password);

  return newUser;
}

module.exports = mongoose.model('User', User);
