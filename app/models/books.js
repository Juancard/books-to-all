'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	title: String,
	author: String,
	goodreadsId: String,
	dateAdded: {
		type: Date,
		default: Date.now
	},
	state: {
    type: String,
    enum: ['active', 'inactive'],
    lowercase: true,
    trim: true
  },
	img: String
});

Book.statics
  .newInstance = function newInstance(title, author, goodreadsId,
		img, state='active') {
  let newBook = new this();

	newBook.title = title;
	newBook.author = author;
	newBook.goodreadsId = goodreadsId;
	newBook.img = img;
	newBook.state = state;

  return newBook;
}

module.exports = mongoose.model('Book', Book);
