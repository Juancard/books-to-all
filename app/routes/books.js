'use strict';

module.exports = function (app, appEnv) {
  let xmlParser = require('xml2json');
  let ApiBookHandler = require(appEnv.path + '/app/controllers/apiBookHandler.server.js');
  let apiBookHandler = new ApiBookHandler();
  let BookHandler = require(appEnv.path + '/app/controllers/bookHandler.server.js');
  let bookHandler = new BookHandler();

  app.param("goodreadsBook",  (req, res, next, goodreadsId) => {
    console.log("Requested goodreadsId: ", goodreadsId);
    bookHandler.getBookByUniqueId(goodreadsId, (err, book) => {
      if (err)
        return next(
          new appEnv.errors.InternalError(
            err,
            "Error in retrieving the requested user's book"
          )
        );
      req.book = book;
      return next();
    });
  });

  app.param("userBook",  function (req, res, next, userBookId) {

    console.log("Requested userBook id: ", userBookId);

    // ... VALIDATE USERBOOK ID
    bookHandler.getUserBookById(userBookId, function(err, userBook){
      if (err)
        return next(
          new appEnv.errors.InternalError(
            err,
            "Error in retrieving the requested user's book"
          )
        );
      if (!userBook || (userBook && userBook.state.state == 'inactive'))
        return next(
          new appEnv.errors.NotFound(
            "The resource requested is not available"
          )
        );
      req.userBook = userBook;
      return next();
    });
  });

  app.param("trade",  function (req, res, next, tradeId) {

    console.log("Requested trade id: ", tradeId);

    // ... VALIDATE trade ID
    bookHandler.getTradeById(tradeId, function(err, trade){
      if (err)
        return next(
          new appEnv.errors.InternalError(
            err,
            "Error in retrieving the requested trade"
          )
        );
      if (!trade || (trade && (trade.state.state != 'pending') && (trade.state.state != 'accepted')))
        return next(
          new appEnv.errors.NotFound(
            "The resource requested is not available"
          )
        );
      req.trade = trade;
      return next();
    });
  });

  app.route('/mytrades')
    .get(appEnv.middleware.isLoggedIn,
      (req, res, next) => {
        console.log("in route mytrades");
        bookHandler.tradesRequestedBy(req.user, (err, tradesRequestedBy) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in retrieveing trades user %s requested",
                req.user.local.displayName
              )
            )
          bookHandler.tradesRequestedTo(req.user, (err, tradesRequestedTo) => {
            if (err)
              return next(
                new appEnv.errors.InternalError(
                  err,
                  "Error in retrieveing trades requested to user %s",
                  req.user.local.displayName
                )
              )
            let out = {
              requester: tradesRequestedBy,
              requested: tradesRequestedTo
            }
            res.render(appEnv.path + '/app/views/pages/books/mytrades.pug', out);
          });
        })
      }
    );

  app.route('/books/mine')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      bookHandler.getBooksByUser(req.user, (err, books) => {
        if (err)
          return next(new appEnv.errors.InternalError(
              err,
              "Error in getting user's books"
            )
          )
        let out = {
          books
        }
        res.render(appEnv.path + "/app/views/pages/books/mybooks.pug", out);
      });
    });

  app.route('/books')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      bookHandler.getAllUserBooks((err, books) => {
        if (err)
          return next(new appEnv.errors.InternalError(
              err,
              "Error in getting user's books"
            )
          )
          bookHandler.getTradesFromUserBookList(books, req.user, (err, trades) => {
            if (err)
              return next(new appEnv.errors.InternalError(
                  err,
                  "Error in getting trades from user's books"
                )
              )
            for (let i=0; i<books.length; i++) {
              books[i].myTrade = trades.filter(
                (trade) => {
                  let tradeUserBookId = trade.userBook;
                  let tradeState = trade.state.state;
                  let isTradeFromThisBook = tradeUserBookId.equals(books[i]._id);
                  let isTradeOpen = tradeState == "accepted" || tradeState == 'pending';
                  return isTradeOpen && isTradeFromThisBook;
                })[0];
            }
            let out = {
              books
            }
            res.render(appEnv.path + "/app/views/pages/books/allbooks.pug", out);
          });
      });
    });

  app.route('/books/search')
    .get((req, res, next) => {
      let field = req.query.search;
      let query = req.query.q;
      apiBookHandler.searchRequest(query, field, (err, response, body) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              'Failed on searching book'
            )
          );
        let data = JSON.parse(xmlParser.toJson(body));
        res.json(data.GoodreadsResponse.search);
      });
    });

  app.route('/books/:goodreadsBook/add')
    .post(appEnv.middleware.isLoggedIn,
      (req, res, next) => {
        console.log("in route add book to user");

        let onError = (err) => {
          return next(
            new appEnv.errors.InternalError(
              err,
              'Failed to add book to user'
            )
          );
        }
        let onBookAddedToUser = (err, result) => {
          if (err) return onError(err);
          res.json({results: result});
        };

        //Goodreads Book to add is already in our db?
        if (!req.book){
          console.log("Book is not on db, let's create it");
          // it's not.
          let bookJson = apiBookHandler.getBookData(req.body.book);
          bookHandler.newBook(bookJson, (err, book) => {
            if (err) return onError(err);
            return bookHandler.addBookToUser(req.user, book, onBookAddedToUser);
          });
        } else {
          // Book already exists in db
          console.log("Book is in db, is it inactive?");
          if (req.book.state == 'inactive')
            res.json({
              message: {
                type: 'danger',
                text: 'Book \"' + req.book.title + '\" is not aloud in our website.'
              }
            });
          console.log("Book is not inactive, let's add it to the user");
          return bookHandler.addBookToUser(req.user, req.book, onBookAddedToUser);
        }
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/remove')
    .delete(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(true),
      appEnv.middleware.books.isTraded(false),
      (req, res, next) => {
      console.log("in route remove book from user");
      bookHandler.removeUserBook(req.userBook, (err, userBookRemoved) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              "Error in removing book"
            )
          )
        res.json({
          results: userBookRemoved,
          message: {
            type: 'info',
            text: 'Succesfully removed ' + req.userBook.book.title
          }
        });
      });
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/toggleRequestable')
    .get(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(true),
      appEnv.middleware.books.isTraded(false),
      (req, res, next) => {
      console.log("in route toggle requestable to other users");
      bookHandler.toggleRequestable(req.userBook, (err, userBookToggled) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              "Error in toggle requestable"
            )
          )
        res.json({
          results: userBookToggled
        });
      });
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/request')
    .post(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(false),
      appEnv.middleware.books.isTraded(false),
      appEnv.middleware.books.isAvailable(true),
      appEnv.middleware.books.isPendingForThisUser(false),
      (req, res, next) => {
        console.log("in route request book");
        bookHandler.request(req.user, req.userBook, (err, result) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in requesting book"
              )
            )
          res.json({
            results: result,
            message: {
              type: 'success',
              text: 'Request sent!'
            }
          });
        })
      }
    );

  app.route('/books/:userBook([a-fA-F0-9]{24})/request/:trade([a-fA-F0-9]{24})/cancel')
    .post(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(false),
      appEnv.middleware.books.isTraded(false),
      appEnv.middleware.books.isAvailable(true),
      appEnv.middleware.books.isTradePending(true),
      (req, res, next) => {
        console.log("in route request book");
        bookHandler.cancelTrade(req.trade, (err, tradeCanceled) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in canceling request"
              )
            )
          res.json({
            results: tradeCanceled,
            message: {
              type: 'info',
              text: 'Request canceled'
            }
          });
        });
      }
    );

  app.route('/books/:userBook([a-fA-F0-9]{24})/request/:trade([a-fA-F0-9]{24})/finish')
    .post(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(false),
      appEnv.middleware.books.isTraded(true),
      appEnv.middleware.books.isTradeRequestedBy(true),
      appEnv.middleware.books.isTradeAccepted(true),
      (req, res, next) => {
        console.log("in route finish trade");
        bookHandler.finishTrade(req.trade, req.userBook, (err, tradeFinished) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in finishing trade"
              )
            )
          res.json({
            results: tradeFinished,
            message: {
              type: 'success',
              text: 'Trade Finished!'
            }
          });
        });
      }
    );

  app.route('/books/:userBook([a-fA-F0-9]{24})/request/:trade([a-fA-F0-9]{24})/deny')
    .post(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(true),
      appEnv.middleware.books.isTraded(false),
      appEnv.middleware.books.isTradePending(true),
      (req, res, next) => {
        console.log("in route deny request");
        bookHandler.denyTrade(req.trade, (err, tradeDenied) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in denying request to trade"
              )
            )
          res.json({
            results: tradeDenied,
            message: {
              type: 'info',
              text: 'Request denied!'
            }
          });
        });
      }
    );

  app.route('/books/:userBook([a-fA-F0-9]{24})/request/:trade([a-fA-F0-9]{24})/accept')
    .post(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(true),
      appEnv.middleware.books.isTraded(false),
      appEnv.middleware.books.isTradePending(true),
      (req, res, next) => {
        console.log("in route accept request");
        bookHandler.acceptTrade(req.trade, req.userBook, (err, tradeAccepted) => {
          if (err)
            return next(
              new appEnv.errors.InternalError(
                err,
                "Error in accepting request to trade"
              )
            )
          res.json({
            results: tradeAccepted,
            message: {
              type: 'success',
              text: 'Request accepted!'
            }
          });
        });
      }
    );
}
