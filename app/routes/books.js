'use strict';

module.exports = function (app, appEnv) {
  let xmlParser = require('xml2json');
  let ApiBookHandler = require(appEnv.path + '/app/controllers/apiBookHandler.server.js');
  let apiBookHandler = new ApiBookHandler();
  let BookHandler = require(appEnv.path + '/app/controllers/bookHandler.server.js');
  let bookHandler = new BookHandler();

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

  app.route('/mybooks')
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

  app.route('/allbooks')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      res.render(appEnv.path + "/app/views/allbooks.pug")
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

  app.route('/books/add')
    .post(appEnv.middleware.isLoggedIn, (req, res, next) => {
      console.log("in route add book to user");
      let bookJson = apiBookHandler.getBookData(req.body.book);
      bookHandler.addBookToUser(req.user, bookJson, (err, result) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              'Failed to add book to user'
            )
          );
        res.json(result);
      });
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/remove')
    .delete(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner,
      (req, res, next) => {
      console.log("in route remove book from user");
      bookHandler.removeUserBook(req.userBook, (err, data) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              "Error in removing book"
            )
          )
        res.json(data);
      });
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/toggleRequestable')
    .get(appEnv.middleware.isLoggedIn,
      appEnv.middleware.books.isOwner,
      appEnv.middleware.books.isNotTraded,
      (req, res, next) => {
      console.log("in route toggle requestable to other users");
      bookHandler.toggleRequestable(req.userBook, (err, data) => {
        if (err)
          return next(
            new appEnv.errors.InternalError(
              err,
              "Error in toggle requestable"
            )
          )
        res.json(data);
      });
    });

  app.route('/books/:userBook([a-fA-F0-9]{24})/request')
    .post(appEnv.middleware.isLoggedIn,
      (req, res, next) => {
      console.log("in route request book");

      res.json(req.userBook);
    });
}
