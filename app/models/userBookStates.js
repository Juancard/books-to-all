'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateHandler = require('../controllers/stateHandler.db.js')
const STATES = ['inactive', 'available', 'traded', 'unavailable'];
const DEFAULT_STATE_NUMBER = 0
const stateHandler = new StateHandler(STATES, DEFAULT_STATE_NUMBER);

var UserBookState = new Schema({
  userBook: {
    type: Schema.Types.ObjectId,
    ref: 'UserBook'
  },
  date: {
    type: Date,
		required: true,
    default: Date.now
  },
	state: {
		type: Number,
		min: 0,
    max: STATES.length - 1,
		required: true,
		set: stateHandler.stateStringToNumber,
		get: stateHandler.stateNumberToString
	},
});

UserBookState.set('toObject', { getters: true });
UserBookState.index({ userBook: 1, date: -1}, { unique: true });

UserBookState.statics
  .newInstance = function newInstance(state='available',userBook=null) {
  let newUserBookState = new this();

	newUserBookState.userBook = userBook;
	newUserBookState.state = state;

  return newUserBookState;
}

UserBookState.statics.getStateNumber = stateHandler.stateStringToNumber;

module.exports = mongoose.model('UserBookState', UserBookState);
