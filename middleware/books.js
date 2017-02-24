'use strict';

let BookHandler = require(process.cwd() + '/app/controllers/bookHandler.server.js');
let bookHandler = new BookHandler();

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
  },
  isAvailable: function isAvailable(iWantItAvailable){
    return (req, res, next) => {
      let isAvailable = req.userBook.state.state == 'available';
      if (isAvailable == iWantItAvailable) return next();
      if (req.xhr) {
        let out = {
          message: {
            type: "danger",
          }
        }
        if (isAvailable)
          out.message.text = "This action is not aloud on an available book.";
        else
          out.message.text = "This action is only aloud on available books.";
        return res.json(out);
      }
    }
  },
  isPendingForThisUser: function isPendingForThisUser(iWantItPending){
    return (req, res, next) => {
      bookHandler.findTradesBy(req.userBook, req.user, (err, trades) => {
        if (err) return next(err);
        let isPendingForThisUser = false;
        for (let i=0; i<trades.length; i++) {
          if (trades[i].state.state == "pending")
            isPendingForThisUser = true;
            break;
        }
        if (isPendingForThisUser == iWantItPending) return next();
        if (req.xhr) {
          let out = {
            message: {
              type: "danger",
            }
          }
          if (isPendingForThisUser)
            out.message.text = "You already requested this book.";
          else
            out.message.text = "You have not requested this book yet";
          return res.json(out);
        }
      });
    }
  },

  isTradePending: function isTradePending(iWantItPending){
    return (req, res, next) => {
      let isPending = req.trade.state.state == 'pending';
      if (isPending == iWantItPending) return next();
      if (req.xhr) {
        let out = {
          message: {
            type: "danger",
          }
        }
        if (isPending)
          out.message.text = "This action is not aloud on a pending trade.";
        else
          out.message.text = "This action is only aloud on pending trades.";
        return res.json(out);
      }
    }
  }
}

module.exports = books;
