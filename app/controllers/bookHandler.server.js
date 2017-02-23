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

  this.newBook = (bookJson, callback) => {
    console.log("in bd creating new book");
    let book = Book.newInstance(bookJson.title, bookJson.author,
      bookJson.goodreadsId, bookJson.imageUrl,
      bookJson.publicationYear);
    book.save((err, result) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Could not save new book \"%s\" in database",
            bookJson.title
          )
        );
      callback(err, result);
    });
  },

  this.addBookToUser = (user, book, callback) => {
    console.log("in bd handler add book to user");
    console.log("user id: ", user.id, "\nbook title: ", book.title);

    // Create new copy of book for the user
    let newUserBookState = UserBookState.newInstance('available');
    let newUserBook = UserBook.newInstance(book.id, user.id, newUserBookState.id);
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
        return callback(false, userBook);
      });
    });
  },

  this.getUserBookById = (bookUserId, callback) => {
    console.log("in bd handler get user book by id ", bookUserId);
    UserBook
      .findById(bookUserId)
      .populate("state")
      .populate("book")
      .exec((err, userBookFound) => {
        if (err) return callback(err);
        callback(false, userBookFound);
    });
  },

  this.setUserBookStateTo = (userBook, newState, callback) => {
    let newStateObject = UserBookState.newInstance(newState, userBook.id);
    newStateObject.save((err, state) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Could not change state to %s for user's book %s",
            newState,
            String(userBook.id)
          )
        );
      userBook.state = state.id;
      callback(false, userBook, newStateObject);
    });
  },

  this.setTradeStateTo = (trade, newState, callback) => {
    let newStateObject = BookTradeState.newInstance(newState, trade.id);
    newStateObject.save((err, state) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Could not change state to %s for trade %s",
            newState,
            String(trade.id)
          )
        );
      trade.state = state.id;
      callback(false, trade, newStateObject);
    });
  },

  this.setUserBookTradesState = (userBook, fromState, toState, callback) => {
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
          if (trade.state.state == fromState){
            this.setTradeStateTo(trade, toState, (err, trade, newState) => {
              if (err)
                return callback(
                  new http_verror.InternalError(
                    err,
                    "Fail on setting new trade's state",
                    String(trade.id),
                    toState
                  )
                );
              trade.save((err, tradeSaved) => {
                if (err)
                  return callback(
                    new http_verror.InternalError(
                      err,
                      "Could not save trade %s after changing its state to %s",
                      String(trade.id),
                      toState
                    )
                  );
                //Trade saved succesfully
                console.log("Trade saved succesfully: ", tradeSaved.id);
              });
            });
            // end of if state==pending
          }
          // end of trade.forEach
        });
      callback(false, userBook);
    });
  },

  this.removeUserBook = (userBook, callback) => {
    console.log("in bd handler removing book of ", userBook.user);

    // SET ALL PENDING REQUESTS TO DENIED
    this.setUserBookTradesState(userBook, 'pending', 'denied', (err, result) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Fail on changing state of trades from this user's book"
          )
        );
      // FInally change state of book to 'inactive'
      this.setUserBookStateTo(userBook, 'inactive', (err, userBook, newState) =>{
        if (err) return callback(err);
        userBook.save((err, userBookSaved) => {
          if (err)
            return callback(
              new http_verror.InternalError(
                err,
                "Could not remove the book"
              )
            );
          userBookSaved.state = newState;
          return callback(false, userBookSaved);
        });
      });
    });
  },

  this.toggleRequestable = (userBook, callback) => {
    console.log("in bd handler toggle requestable book of ", userBook.user);

    let onNewStateCallback = (err, userBook, newState) => {
      if (err) return callback(err);
      userBook.save((err, userBookSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not save user's book with new state %s",
              newState.state
            )
          );
        userBookSaved.state = newState;
        return callback(false, {
          results: userBookSaved
        });
      })
    }

    if (userBook.state.state == 'available'){
      this.setUserBookTradesState(userBook, 'pending', 'denied', (err, result) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Fail on changing state of trades from this user's book"
            )
          );
        this.setUserBookStateTo(userBook, 'unavailable', onNewStateCallback);
      });
    } else {
      this.setUserBookStateTo(userBook, 'available', onNewStateCallback);
    }
  }

}

module.exports = bookHandler;
