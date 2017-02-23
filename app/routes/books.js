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

  app.route('/books/mine')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      bookHandler.getBooksByUser(req.user, (err, results) => {
        if (err)
          return next(new appEnv.errors.InternalError(
              err,
              "Error in getting user's books"
            )
          )
        let out = {
          books: results
        }
        res.render(appEnv.path + "/app/views/mybooks.pug", out);
      });
    });

  app.route('/books/all')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      bookHandler.getAllUserBooks((err, results) => {
        if (err)
          return next(new appEnv.errors.InternalError(
              err,
              "Error in getting user's books"
            )
          )
        let out = {
          books: results
        }
        res.render(appEnv.path + "/app/views/allbooks.pug", out)
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
                text: 'Book \"' + book.title + '\" is not aloud in our website.'
              }
            });
          console.log("Book is not inactive, let's add it to the user");
          return bookHandler.addBookToUser(req.user, req.book, onBookAddedToUser);
        }
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/remove')
    .delete(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner(true),
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
            type: 'success',
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
      (req, res, next) => {
        console.log("in route request book");

        res.json({
          results: req.userBook,
          message: {
            type: 'success',
            text: 'Request sent!'
          }
        });
      }
    );
}
