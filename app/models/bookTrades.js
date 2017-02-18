'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookTrade = new Schema({
  userBook: {
    type: Schema.Types.ObjectId,
    ref: 'UserBook'
  },
	requestedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
	dateAdded: {
    type: Date,
    default: Date.now
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: 'BookTradeState'
  },
	startsOn: {
    type: Date,
    default: Date.now
  },
  endsOn: {
    type: Date,
    default: function(){ // a week from now
      return +new Date() + 7*24*60*60*1000
    }
  }
});

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
