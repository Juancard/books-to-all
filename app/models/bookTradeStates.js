'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookTradeState = new Schema({
	bookTrade: {
    type: Schema.Types.ObjectId,
    ref: 'BookTrade'
  },
  date: {
    type: Date,
    default: Date.now
  },
  state: {
    type: String,
    enum: ['pending', 'accepted', 'denied', 'finished'],
    lowercase: true,
    trim: true
  }
});

BookTradeState.statics
  .newInstance = function newInstance(bookTrade, state='pending') {
  let newBookTradeState = new this();

	newBookTradeState.bookTrade = bookTrade;
	newBookTradeState.state = state;

  return newBookTradeState;
}

module.exports = mongoose.model('BookTradeState', BookTradeState);
