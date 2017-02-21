'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateHandler = require('../controllers/stateHandler.db.js')
const STATES = ['pending', 'canceled', 'denied', 'accepted', 'finished'];
const DEFAULT_STATE_NUMBER = 0
const stateHandler = new StateHandler(STATES, DEFAULT_STATE_NUMBER);

var BookTradeState = new Schema({
	bookTrade: {
    type: Schema.Types.ObjectId,
		required: true,
    ref: 'BookTrade'
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

BookTradeState.set('toObject', { getters: true });
BookTradeState.index({ bookTrade: 1, date: -1}, { unique: true });

BookTradeState.statics
  .newInstance = function newInstance(state='pending', bookTrade=null) {
  let newBookTradeState = new this();

	newBookTradeState.bookTrade = bookTrade;
	newBookTradeState.state = state;

  return newBookTradeState;
}

BookTradeState.statics.getStateNumber = stateHandler.stateStringToNumber;

module.exports = mongoose.model('BookTradeState', BookTradeState);
