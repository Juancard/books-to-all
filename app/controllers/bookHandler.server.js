'use strict';

var Book = require('../models/books.js');
var UserBook = require('../models/userBooks.js');
var UserBookState = require('../models/userBookStates.js');
var BookTrade = require('../models/bookTrades.js');
var BookTradeState = require('../models/bookTradeStates.js');
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
    UserBook
      .find({
        user: user.id
      })
      .sort({ dateAdded: -1 })
      .populate('book')
      .populate('state')
      .exec( (err, booksFound) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve user's active books by user Id"
            )
          );
        let books = booksFound.filter(
          (book) => book.state.state != 'inactive'
        );
        callback(false, books);
      });
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
          let newUserBookState = UserBookState.newInstance('available');
          let newUserBook = UserBook.newInstance(result.id, user.id, newUserBookState.id);
          newUserBook.save((err, userBook) => {
            if (err)
              return callback(
                new http_verror.InternalError(
                  err,
                  "Could not add book to user in database"
                )
              );
            newUserBookState.userBook = userBook.id;
            newUserBookState.save((err, userBookState) => {
              if (err)
                return callback(
                  new http_verror.InternalError(
                    err,
                    "Could not save the state of the new book in database"
                  )
                );
              // populate before returning userBook to user
              userBook.book = book;
              userBook.state = userBookState;
              return callback(false, {results: userBook});
            });
          });
        });
      });
  },

  this.getUserBookById = (bookUserId, callback) => {
    console.log("in bd handler get user book by id ", bookUserId);
    UserBook
      .findById(bookUserId)
      .populate("state")
      .exec((err, userBookFound) => {
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
    if (userBook.state.state == 'traded') {
      return callback(false, {
        message: {
          type: "danger",
          text: "Traded books can not be removed."
        }
      });
    } else if (userBook.state.state == 'inactive') {
      return callback(false, {
        message: {
          type: "danger",
          text: "Book has already been removed."
        }
      });
    }

    // Let's remove it
    // SET ALL PENDING REQUESTS TO DENIED
    BookTrade
      .find({'userBook': userBook.id})
      .populate('state')
      .exec((err, trades) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve trades of this book"
            )
          );
        trades.forEach((trade) => {
          if (trade.state.state == 'pending'){
            let newState = BookTradeState.newInstance('denied', trade.id);
            newState.save((err, state) => {
              if (err)
              return callback(
                new http_verror.InternalError(
                  err,
                  "Could not change state from pending to denied for request %s",
                  String(trade.id)
                )
              );
              trade.state = state.id;
              trade.save((err, tradeSaved) => {
                if (err)
                  return callback(
                    new http_verror.InternalError(
                      err,
                      "Could not save request %s after changing its state to denied",
                      String(trade.id)
                    )
                  );
                //Trade saved succesfully
                console.log("Trade saved succesfully: ", tradeSaved.id);
              });
              //end of new state saving
            });
            // end of if state==pending
          }
          // end of trade.forEach
        });

        // FInally change state of book to 'inactive'
        let newUserBookState = UserBookState.newInstance('inactive', userBook.id);
        newUserBookState.save((err, userBookState) => {
          if (err)
            return callback(
              new http_verror.InternalError(
                err,
                "Could not save the new state of the user's book"
              )
            );
          userBook.state = userBookState.id;
          userBook.save((err, userBookSaved) => {
            if (err)
              return callback(
                new http_verror.InternalError(
                  err,
                  "Could not remove the book"
                )
              );
            callback(false, {results: userBookSaved});
          })
        });
      })
  }

}

module.exports = bookHandler;
