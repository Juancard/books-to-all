'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	title: String,
	author: String,
	img: String
});

Book.statics
  .newInstance = function newInstance(title, author, img) {
  let newBook = new this();

	newBook.title = title;
	newBook.author = author;
	newBook.img = img;

  return newBook;
}

module.exports = mongoose.model('Book', Book);
