'use strict';

let UserBook = require(process.cwd() + '/app/models/userBooks.js');

let books = {
  isOwner: function isOwner(req, res, next){
    if (req.user._id.equals(req.userBook.user)){
      return next();
    } else {
      if (req.xhr)
        return res.json({
          message: {
            type: "danger",
            text: "Only the owner of the book perform this action"
          }
        });
    }
  },
  isNotTraded: function isTraded(req, res, next){
    if (req.userBook.state.state != 'traded'){
      return next();
    } else {
      if (req.xhr)
        return res.json({
          message: {
            type: "danger",
            text: "This action is not aloud on traded book."
          }
        });
    }
  }
}

module.exports = books;
