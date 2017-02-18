'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookTrade = new Schema({
  userBook: {
    type: Schema.Types.ObjectId,
    ref: 'UserBook',
    required: true
  },
	requestedBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
	dateAdded: {
    type: Date,
    required: true,
    default: Date.now
  },
  state: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'BookTradeState'
  },
	startsOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  endsOn: {
    type: Date,
    required: true,
    default: function(){ // a week from now
      return +new Date() + 7*24*60*60*1000
    }
  }
});

BookTrade.index({ userBook: 1, requestedBy: 1, dateAdded:-1}, { unique: true });

BookTrade.statics
  .newInstance = function newInstance(userBook, requestedBy, state,
    startsOn=false, endsOn=false) {
  let newBookTrade = new this();

	newBookTrade.userBook = userBook;
	newBookTrade.requestedBy = requestedBy;
  if (startsOn) newBookTrade.startsOn = startsOn;
  if (startsOn) newBookTrade.endsOn = endsOn;
  newBookTrade.state = state;

  return newBookTrade;
}

module.exports = mongoose.model('BookTrade', BookTrade);
