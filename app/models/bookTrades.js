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

UserBook.index({ userBook: 1, requestedBy: 1, dateAdded:-1}, { unique: true });

BookTrade.statics
  .newInstance = function newInstance(userBook, requestedBy, state,
    startsOn=false, endsOn=false) {
  let newBookTrade = new this();

	newBookTrade.userBook = userBook;
	newBookTrade.requestedBy = requestedBy;
	newBookTrade.state = state;
  (startsOn)? newBookTrade.startsOn = startsOn;
  (startsOn)? newBookTrade.endsOn = endsOn;

  return newBookTrade;
}

module.exports = mongoose.model('BookTrade', BookTrade);
