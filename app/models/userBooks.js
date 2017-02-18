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
    ref: 'User'
    required: true,
  },
  state: {
    type: String,
    enum: ['active', 'inactive'],
    required: true,
    lowercase: true,
    trim: true
  },
  dateAdded: {
    required: true
    type: Date,
    default: Date.now
  },
	img: {
    type: String
  }
});

UserBook.index({ book: 1, user: 1}, { unique: true });

UserBook.statics
  .newInstance = function newInstance(book, user, state='active'
    , img=null) {
  let newBookUser = new this();

	newBookUser.book = book;
	newBookUser.user = user;
  newBookUser.state = state;
	newBookUser.img = img;

  return newBookUser;
}

module.exports = mongoose.model('UserBook', UserBook);
