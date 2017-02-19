'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateHandler = require('../controllers/stateHandler.db.js')
const STATES = ['inactive', 'active'];
const DEFAULT_STATE_NUMBER = 0
const stateHandler = new StateHandler(STATES, DEFAULT_STATE_NUMBER);

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
		type: Number,
		min: 0,
    max: STATES.length - 1,
		required: true,
		set: stateHandler.stateStringToNumber,
		get: stateHandler.stateNumberToString
	},
	imageUrl: {
		type: String,
		required: true
	},
	publicationYear: {
		type: Number
	}
});

/****************** States getter and setter ********************/
Book.set('toObject', { getters: true });
function stateStringToNumber (stateString) {
	stateString = stateString.trim().toLowerCase();
	let stateNumber = STATES.indexOf(stateString);
  return (stateString == -1)? DEFAULT_STATE_NUMBER : stateNumber;
}
function stateNumberToString (stateNumber) {
	if (stateNumber >= STATES.length)
		stateNumber = DEFAULT_STATE_NUMBER;
  return STATES[stateNumber];
}
Book.statics
  .getStateNumber = function getStateNumber(stateString) {
    return stateStringToNumber(stateString);
  }
/****************** END - States getter and setter **************/

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

Book.statics.getStateNumber = stateHandler.stateStringToNumber;

module.exports = mongoose.model('Book', Book);
