'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    type: String,
		required: true,
    enum: ['pending', 'accepted', 'denied', 'finished'],
    lowercase: true,
    trim: true
  }
});

BookTradeState.index({ bookTrade: 1, date: -1}, { unique: true });

BookTradeState.statics
  .newInstance = function newInstance(bookTrade, state='pending') {
  let newBookTradeState = new this();

	newBookTradeState.bookTrade = bookTrade;
	newBookTradeState.state = state;

  return newBookTradeState;
}

module.exports = mongoose.model('BookTradeState', BookTradeState);
