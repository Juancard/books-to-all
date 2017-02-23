'use strict';

let UserBook = require(process.cwd() + '/app/models/userBooks.js');

let books = {
  isOwner: function isOwner(iWantTheOwner){
    return (req, res, next) => {
      let isOwner = req.user._id.equals(req.userBook.user);
      if (isOwner == iWantTheOwner) return next();
      if (req.xhr) {
        let out = {
          message: {
            type: "danger",
          }
        }
        if (isOwner)
          out.message.text = "The owner of the book can not perform this action.";
        else
          out.message.text = "Only the owner of the book can perform this action.";
        return res.json(out);
      }
    }
  },
  isTraded: function isTraded(iWantItTraded){
    return (req, res, next) => {
      let isTraded = req.userBook.state.state == 'traded';
      if (isTraded == iWantItTraded) return next();
      if (req.xhr) {
        let out = {
          message: {
            type: "danger",
          }
        }
        if (isTraded)
          out.message.text = "This action is not aloud on a traded book.";
        else
          out.message.text = "This action is only aloud on a traded book.";
        return res.json(out);
      }
    }
  }
}

module.exports = books;
