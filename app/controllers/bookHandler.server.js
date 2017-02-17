'use strict';

var Book = require('../models/books.js');
var User = require('../models/users.js');
var http_verror = require('http-verror');

function bookHandler () {
  this.getBookById = (bookId, callback) => {
    Book
      .findById(bookId)
      .exec((err, result) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              'Could not find book by Id'
            )
          );
        callback(false, result);
      });
  },
  this.getBooksByUser = (user, callback) => {
    console.log("Searching books in bd by user:", user.id);
    Book
      .find({
        _id: {
          $in: user.books
        }
      })
      .exec( (err, results) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              "Could not retrieve user's book"
            )
          );
        callback(false, results);
      })
  }
}

module.exports = bookHandler;
