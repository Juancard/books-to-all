'use strict';

var Book = require('../models/books.js');
var UserBook = require('../models/userBooks.js');
var BookTrade = require('../models/bookTrades.js');
var User = require('../models/users.js');
var http_verror = require('http-verror');

function bookHandler () {
  this.getBookByUniqueId = (bookUniqueId, callback) => {
    Book
      .findOne({goodreadsId: bookUniqueId})
      .exec((err, result) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              'Could not find book by unique Id'
            )
          );
        callback(false, result);
      });
  },
  this.getBooksByUser = (user, callback) => {
    console.log("Searching books in bd by user:", user.id);
    let stateNumber = UserBook.getStateNumber('available');
    UserBook
      .find({
        user: user.id,
        state: stateNumber
      })
      .sort({ dateAdded: -1 })
      .populate('book')
      .exec( (err, results) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve user's active books by user Id"
            )
          );
        callback(false, results);
      })
  },
  this.addBookToUser = (user, bookJson, callback) => {
    console.log("in bd handler add book to user");
    console.log("user id: ", user.id, "\nbook title: ", bookJson.title);

    //First add Book
    // check if book is already in bd
    Book
      .findOne({goodreadsId: bookJson.goodreadsId})
      .exec((err, book) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "On checking if book exists in database"
            )
          );
        if (!book) {
          // Book was not in bd.
          book = Book.newInstance(bookJson.title, bookJson.author,
            bookJson.goodreadsId, bookJson.imageUrl,
            bookJson.publicationYear);
        }
        console.log("book before saving: ", book);
        if (book.state == 'inactive')
          return callback(false, {
            message: {
              type: 'danger',
              text: 'Book \"' + book.title + '\" is not aloud in our website.'
            }
          })
        book.save((err, result) => {
          if (err)
            return callback(
              new http_verror.InternalError(
                err,
                "Could not save book in database"
              )
            );
          // Create new copy of book for the user
          let newUserBook = UserBook.newInstance(result.id, user.id);
          newUserBook.save((err, result) => {
            if (err)
              return callback(
                new http_verror.InternalError(
                  err,
                  "Could not add book to user in database"
                )
              );
            result.book = book;
            return callback(false, {results: result});
          })
        })
      });
  },

  this.getUserBookById = (bookUserId, callback) => {
    console.log("in bd handler get user book by id ", bookUserId);
    UserBook.findById(bookUserId).exec((err, userBookFound) => {
      if (err) return callback(err);
      callback(false, userBookFound);
    });
  },

  this.removeUserBook = (user, userBook, callback) => {
    console.log("in bd handler removing book of ", userBook.user, " from user ", user._id);

    if (!user._id.equals(userBook.user)) {
      return callback(false, {
        message: {
          type: "danger",
          text: "Only the owner of the book can remove it."
        }
      });
    }

    console.log("State of book: ", userBook.state);
    if (userBook.state == 'traded') {
      return callback(false, {
        message: {
          type: "danger",
          text: "Traded books can not be removed."
        }
      });
    }

    // Let's remove it
    // SET ALL PENDING REQUESTS TO DENIED

    callback(false, {results: userBook})
  }

}

module.exports = bookHandler;
