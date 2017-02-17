'use strict';

module.exports = function (app, appEnv) {
  let xmlParser = require('xml2json');
  let ApiBookHandler = require(appEnv.path + '/app/controllers/apiBookHandler.server.js');
  let apiBookHandler = new ApiBookHandler();
  let BookHandler = require(appEnv.path + '/app/controllers/bookHandler.server.js');
  let bookHandler = new BookHandler();

  app.route('/mybooks')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      bookHandler.getBooksByUser(req.user, (err, results) => {
        console.log("Books found:", results);
        if (err)
          return next(new appEnv.errors.InternalError(
              err,
              "Error in getting user's books"
            )
          )
        let out = {
          books: results
        }
        console.log("Route - Found: ", out);
        res.render(appEnv.path + "/app/views/mybooks.pug", out);
      });
    });

  app.route('/allbooks')
    .get(appEnv.middleware.isLoggedIn, (req, res, next) => {
      res.render(appEnv.path + "/app/views/allbooks.pug")
    });

  app.route('/books/search')
    .get((req, res, next) => {
      let field = req.query.field;
      let query = req.query.q;
      apiBookHandler.searchRequest(query, field, (err, response, body) => {
        if (err) return next(new appEnv.errors.InternalError(err, 'In searching books'));
        let data = JSON.parse(xmlParser.toJson(body));
        res.json(data);
      });
    });
}
