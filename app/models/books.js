'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	goodreadsId: {
		type: Number,
		required: true,
		index: true
	},
	dateAdded: {
		type: Date,
		required: true,
		default: Date.now
	},
	state: {
    type: String,
    enum: ['active', 'inactive'],
		required: true,
    lowercase: true,
    trim: true
  },
	imageUrl: {
		type: String,
		required: true
	},
	publicationYear: {
		type: Number
	}
});

Book.statics
  .newInstance = function newInstance(title, author, goodreadsId,
		imageUrl, publicationYear, state='active') {
  let newBook = new this();

	newBook.title = title;
	newBook.author = author;
	newBook.goodreadsId = goodreadsId;
	newBook.imageUrl = imageUrl;
	newBook.state = state;
	newBook.publicationYear = publicationYear;

  return newBook;
}

module.exports = mongoose.model('Book', Book);
