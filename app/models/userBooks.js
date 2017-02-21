'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'UserBookState'
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


UserBook.index({ book: 1, user: 1, dateAdded: -1}, { unique: true });

UserBook.statics
  .newInstance = function newInstance(book, user, userBookState, imageUrl=null) {
  let newBookUser = new this();

	newBookUser.book = book;
	newBookUser.user = user;
  newBookUser.state = userBookState;
	newBookUser.imageUrl = imageUrl;

  return newBookUser;
}

module.exports = mongoose.model('UserBook', UserBook);
