'use strict';

let UserBook = require(process.cwd() + '/app/models/userBooks.js');

let books = {
  isOwner: function isOwner(isOwnerFlag){
    return (req, res, next) => {
      if (req.user._id.equals(req.userBook.user) == isOwnerFlag){
        return next();
      } else {
        if (req.xhr)
          return res.json({
            message: {
              type: "danger",
              text: "Only the owner of the book can perform this action"
            }
          });
      }
    }
  },
  isTraded: function isTraded(isTradedFlag){
    return (req, res, next) => {
      if ((req.userBook.state.state == 'traded') == isTradedFlag){
        return next();
      } else {
        if (req.xhr)
          return res.json({
            message: {
              type: "danger",
              text: "This action is not aloud on a traded book."
            }
          });
      }
    }
  }
}

module.exports = books;
