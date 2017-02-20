'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateHandler = require('../controllers/stateHandler.db.js')
const STATES = ['inactive', 'available', 'traded', 'unavailable'];
const DEFAULT_STATE_NUMBER = 0
const stateHandler = new StateHandler(STATES, DEFAULT_STATE_NUMBER);

var UserBook = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  state: {
		type: Number,
		min: 0,
    max: STATES.length - 1,
		required: true,
		set: stateHandler.stateStringToNumber,
		get: stateHandler.stateNumberToString
	},
  dateAdded: {
    required: true,
    type: Date,
    default: Date.now
  },
	imageUrl: {
    type: String
  }
});


UserBook.set('toObject', { getters: true });
UserBook.index({ book: 1, user: 1, dateAdded: -1}, { unique: true });

UserBook.statics
  .newInstance = function newInstance(book, user, imageUrl=null,
    state='available') {
  let newBookUser = new this();

	newBookUser.book = book;
	newBookUser.user = user;
  newBookUser.state = state;
	newBookUser.imageUrl = imageUrl;

  return newBookUser;
}

UserBook.statics.getStateNumber = stateHandler.stateStringToNumber;

module.exports = mongoose.model('UserBook', UserBook);
