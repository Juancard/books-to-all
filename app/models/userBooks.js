'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserBook = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  state: { 
    type: String,
    enum: ['active', 'inactive'],
    lowercase: true,
    trim: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
	img: String
});

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
