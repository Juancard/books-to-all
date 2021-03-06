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
  this.getAllUserBooks = (callback) => {
    console.log("Searching all user books in db");
    UserBook
      .find({})
      .sort({ dateAdded: -1 })
      .populate('book')
      .populate('state')
      .exec( (err, booksFound) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve all users books"
            )
          );
        let books = booksFound.filter(
          (book) => book.state.state != 'inactive' &&
                    book.state.state != 'unavailable'
        );
        callback(false, books);
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

  this.findTradesByUserBook = (userBook, callback) => {
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
        return callback(false, trades);
      });
  },

  this.findTradesBy = (userBook, requestedBy, callback) => {
    BookTrade
      .find({
        'userBook': userBook.id,
        'requestedBy': requestedBy.id
      })
      .populate('state')
      .exec((err, trades) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve trades of the book"
            )
          );
        return callback(false, trades);
      });
  },

  this.getTradeById = (tradeId, callback) => {
    BookTrade
      .findById(tradeId)
      .populate('state')
      .exec((err, trade) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Could not retrieve trade from id"
            )
          );
        return callback(false, trade);
      });
  },

  this.setUserBookTradesState = (userBook, fromState, toState, callback) => {

    this.findTradesByUserBook(userBook, (err, trades) => {
      if (err) return callback(err);

      let updateTradeState = (trade) => {
        return new Promise(
          (resolve, reject) => {
            // Only update 'fromState' trades
            if (trade.state.state != fromState)
              // is not 'fromState', do nothing, just return
              return resolve(trade);

            this.setTradeStateTo(trade, toState, (err, trade, newState) => {
              if (err)
                return reject(
                  new http_verror.InternalError(
                    err,
                    "Fail on setting new trade's state",
                    String(trade.id),
                    toState
                  )
                );
              trade.save((err, tradeSaved) => {
                if (err)
                  return reject(
                    new http_verror.InternalError(
                      err,
                      "Could not save trade %s after changing its state to %s",
                      String(trade.id),
                      toState
                    )
                  );
                //Trade saved succesfully
                resolve(tradeSaved);
              });
            });
          }
        );
      }

      let updatedTrades = trades.map(updateTradeState);
      Promise.all(updatedTrades).then(
        (trades) => callback(false, trades),
        (error) => callback(error)
      );
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
        return callback(false, userBookSaved);
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
  },

  this.request = (user, userBook, callback) => {
    let newTradeState = BookTradeState.newInstance('pending');
    let newBookTrade = BookTrade.newInstance(
      userBook,
      user._id,
      newTradeState
    );

    newBookTrade.save((err, tradeSaved) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Failed on creating new trade"
          )
        );
      newTradeState.bookTrade = newBookTrade._id;
      console.log(newBookTrade);
      newTradeState.save((err, stateSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Failed on creating state \"pending\" for the new trade"
            )
          );
        tradeSaved.state = stateSaved;
        console.log(newTradeState);
        return callback(false, tradeSaved);
      })
    });
  },

  this.getTradesFromUserBookList = (usersBooks, user, callback) => {
    let usersBooksId = usersBooks.reduce(
      (prev, post) => {
        prev.push(post._id);
        return prev;
      }, []);
    BookTrade
      .find({
        'userBook': {
          $in: usersBooksId
        },
        'requestedBy': user._id
      })
      .populate('state')
      .populate('requestedBy')
      .exec((err, trades) => {
        if (err) return callback(err);
        return callback(false, trades);
      })
  },

  this.cancelTrade = (trade, callback) => {
    this.setTradeStateTo(trade, 'canceled', (err, tradeCanceled) => {
      if (err) return callback(err);
      tradeCanceled.save((err, tradeSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Failed on saving canceled trade"
            )
          );
        return callback(false, tradeSaved);
      });
    });
  }

  this.tradesRequestedBy = (user, callback) => {
    BookTrade.find({
      'requestedBy': user._id
    })
    .populate('requestedBy')
    .populate('state')
    .populate({
      path: "userBook",
      model: "UserBook",
      populate: [{
        path: 'state',
        model: 'UserBookState'
      }, {
        path: 'user',
        model: 'User'
      }, {
        path: 'book',
        model: 'Book'
      }]
    })
    .sort({dateAdded: -1})
    .exec((err, userBooks) => {
      if (err) return callback(err);
      return callback(false, userBooks);
    })
  },

  this.tradesRequestedTo = (user, callback) => {
    UserBook.find({
      'user': user._id
    })
    .exec((err, userBooks) => {
      if (err)
        return callback(
          new http_verror.InternalError(
            err,
            "Failed on retrieving books user own"
          )
        );
      let userBooksIds = userBooks.reduce((prev, post) => {
        prev.push(post._id);
        return prev;
      }, []);
      BookTrade
        .find({
          'userBook': {
            $in: userBooksIds
          }
        })
        .populate("state")
        .populate('requestedBy')
        .populate({
          path: "userBook",
          model: "UserBook",
          populate: [{
            path: 'state',
            model: 'UserBookState'
          }, {
            path: 'user',
            model: 'User'
          }, {
            path: 'book',
            model: 'Book'
          }]
        })
        .sort({dateAdded: -1})
        .exec((err, tradesRequestedTo) => {
          if (err) return callback(err);
          return callback(false, tradesRequestedTo);
        });
    })
  },

  this.finishTrade = (trade, userBook, callback) => {
    this.setTradeStateTo(trade, 'finished', (err, tradeFinished) => {
      if (err) return callback(err);
      tradeFinished.save((err, tradeSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Failed on saving finished trade"
            )
          );
        this.setUserBookStateTo(userBook, 'available', (err, userBookTraded) => {
          if (err) return callback(err);
          userBookTraded.save((err, userBookTradedSaved) => {
            if (err)
              return callback(
                new http_verror.InternalError(
                  err,
                  "Failed on saving user book traded"
                )
              );
            return callback(false, tradeSaved);
          });
        });
      });
    });
  },

  this.denyTrade = (trade, callback) => {
    this.setTradeStateTo(trade, 'denied', (err, tradeDenied) => {
      if (err) return callback(err);
      tradeDenied.save((err, tradeSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Failed on saving denied trade"
            )
          );
        return callback(false, tradeSaved);
      });
    });
  },

  this.acceptTrade = (trade, userBook, callback) => {
    this.setTradeStateTo(trade, 'accepted', (err, tradeAccepted) => {
      if (err) return callback(err);
      tradeAccepted.save((err, tradeSaved) => {
        if (err)
          return callback(
            new http_verror.InternalError(
              err,
              "Failed on saving accepted trade"
            )
          );
        this.setUserBookTradesState(userBook, 'pending', 'denied', (err, trades) => {
          if (err) return callback(err);
          this.setUserBookStateTo(userBook, 'traded', (err, userBookTraded) => {
            if (err) return callback(err);
            userBookTraded.save((err, userBookTradedSaved) => {
              if (err)
                return callback(
                  new http_verror.InternalError(
                    err,
                    "Failed on saving user book traded"
                  )
                );
              return callback(false, tradeSaved);
            });
          });
        });
      });
    });
  }
}

module.exports = bookHandler;
