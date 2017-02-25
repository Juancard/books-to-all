'use strict';

(function () {

  ajaxFunctions.ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  //**************** ADD BOOK ***********************
  let urlBook = appUrl + '/books';
  let urlSearchBooks = urlBook + '/search';
  let urlAdd = '/add';
  let urlRemove = '/remove';
  let urlToggle = '/toggleRequestable';
  let urlRequest = "/request";
  let urlCancel = "/cancel";
  let urlFinish = "/finish";
  let urlAccept = "/accept";
  let urlDeny = "/deny";

  let formAddBook = document.forms['addBookForm'] || null;

  if (formAddBook) {
    let btnSubmitBook = formAddBook.getElementsByTagName('BUTTON')[0];

    let onAddBook = e => {
      e.preventDefault();
      btnSubmitBook.disabled = true;
      let url = urlSearchBooks + '?field=all&q=' + e.target.book.value;

      ajaxFunctions.ajaxRequest(
        'GET',
        url,
        null,
        ajaxFunctions.onDataReceived(
          (err, searchResults) => {
            btnSubmitBook.disabled = false;
            if (!searchResults) return;
            let books = searchResults.work;
            if (!books)
              return errorHandler.onMessage({
                message: {
                  type: 'info',
                  text: 'No Books found'
                }
              });
            // HARDCODE: CHOOSE BOOK ARBITRARIALY
            let bookChosen = books[0];
            addToUserBooks(bookChosen)
          }
        )
      );
    }
    formAddBook.addEventListener('submit', onAddBook);

    function addToUserBooks(bookChosen){
      console.log("Book to add: ", bookChosen.id);
      let url = urlBook +'/' + bookChosen.id['$t'] + urlAdd;
      let out = {
        book: bookChosen
      }
      ajaxFunctions.ajaxRequest(
        'POST',
        url,
        out,
        ajaxFunctions.onDataReceived(
          (err, data) => {
            if (data) return addBookElement(data)
          }
        )
      );
    }

    //**************** END ADD BOOK ***********************

    //**************** ADD BOOK ELEMENT ***********************

    const bookTemplate = document.getElementById('book-template').firstChild;
    const bookContainer = document.getElementsByClassName('books')[0].firstChild;

    function addBookElement(userBook){
      let toClear = document.getElementById('noBooks');
      if (toClear) toClear.outerHTML = '';

      let newBookElement = bookTemplate.cloneNode(true);

      let classBook = newBookElement.getElementsByClassName('book')[0];
      //tooltip title, not book title
      classBook.title = userBook.book.title + " by " + userBook.book.author;

      let linkBook = classBook.getElementsByTagName('A')[0];
      linkBook.href = userBook.imageUrl || userBook.book.imageUrl;

      let imageBook = linkBook.getElementsByTagName('IMG')[0];
      imageBook.alt = "book-" + userBook.book.title;
      imageBook.src = userBook.imageUrl || userBook.book.imageUrl;

      /*TODO
        CREATE BUTTONS HERE
      */

      bookContainer.insertBefore(newBookElement, bookContainer.firstChild);
    }

    //**************** END ADD BOOK ELEMENT ***********************

    // end if formAddBook
  }


  //**************** ACTIONS FOR BOOK USER ***********************

  let classesBookAction = document.getElementsByClassName('bookAction');

  let onBooksActionClick = e => {
    if (e.target && e.target.nodeName === "BUTTON") {
      let buttonClicked = e.target;
      let userBookId = buttonClicked.parentElement.getElementsByClassName('userBookId')[0].value
      let tradeId = buttonClicked.parentElement.getElementsByClassName('tradeId')
      if (tradeId.length > 0) tradeId = tradeId[0].value;
      let buttonValue = buttonClicked.value;

      buttonClicked.disabled = true;
      let callback = () => {
        buttonClicked.disabled = false;
      }

      if (buttonValue == 'remove')
        return onRemoveUserBook(userBookId, callback);
      if (buttonValue == 'toggleRequestable')
        return onToggleRequestableUserBook(userBookId, callback);
      if (buttonValue == 'request')
        return onRequestUserBook(userBookId, callback);
      if (buttonValue == 'cancel')
        return onCancelRequest(userBookId, tradeId, callback);
      if (buttonValue == 'finish')
        return onFinishTrade(userBookId, tradeId, callback);
      if (buttonValue == 'deny')
        return onDenyRequest(userBookId, tradeId, callback);
      if (buttonValue == 'accept')
        return onAcceptRequest(userBookId, tradeId, callback);
    }
    e.stopPropagation();
  }

  for (let i=0; i<classesBookAction.length; i++)
    classesBookAction[i].addEventListener('click', onBooksActionClick, false);

  //**************** END ACTIONS FOR BOOK USER ****************

  //**************** REMOVE BOOK USER ***********************
  function onRemoveUserBook(bookUserId, callback){
    console.log("on remove user book", bookUserId);
    let url = urlBook + '/' + bookUserId + urlRemove;
    ajaxFunctions.ajaxRequest('DELETE', url,
      null, ajaxFunctions.onDataReceived(
        (err, removed) => {
          if (removed)
            document.getElementById(removed._id).outerHTML = ''
          return callback();
        }
      )
    )
  }

  //**************** END REMOVE BOOK USER ***********************

  //**************** SET BOOK USER AVAILABLE OR NOT *************

  function onToggleRequestableUserBook(bookUserId, callback){
    console.log("on toggle Requestable user book", bookUserId);
    let url = urlBook + '/' + bookUserId + urlToggle;
    ajaxFunctions.ajaxRequest('GET', url, null, ajaxFunctions.onDataReceived((err, toggled) => {
      if (toggled) {
        let bookElement = document.getElementById(toggled._id)
        let buttons = bookElement.getElementsByTagName('BUTTON');
        for (let i=0; i<buttons.length; i++){
          if (buttons[i].value == 'toggleRequestable'){
            console.log(toggled);
            //HARDCODE: SHOULD ASK FOR STATE STRING 'UNAVAILABLE', NOT STATE NUMBER 3
            buttons[i].textContent = (toggled.state.state != 3)? "Accepts trades" : "No trades Accepted";
          }
        }
      }
      callback();
    }))
  }

  //*********** END SET BOOK USER AVAILABLE OR NOT *************

  //******************* REQUEST BOOK USER **********************

  function onRequestUserBook(bookUserId, callback){
    console.log("on request user book", bookUserId);
    let url = urlBook + '/' + bookUserId + urlRequest;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, requested) => {
      if (requested) {
        console.log(requested);
      }
      callback();
    }))
  }

  //****************** END REQUEST BOOK USER ********************

  //******************* CANCEL BOOK REQUEST **********************

  function onCancelRequest(bookUserId, tradeId, callback){
    console.log("on cancel request", bookUserId, tradeId);
    let url = urlBook + '/' + bookUserId + urlRequest + '/' + tradeId + urlCancel;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, canceled) => {
      if (canceled) {
        console.log(canceled);
      }
      callback();
    }))
  }

  //****************** END CANCEL BOOK REQUEST ********************

  //******************* FINISH trade **********************

  function onFinishTrade(bookUserId, tradeId, callback){
    console.log("on finish trade", bookUserId, tradeId);
    let url = urlBook + '/' + bookUserId + urlRequest + '/' + tradeId + urlFinish;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, finished) => {
      if (finished) {
        console.log(finished);
      }
      callback();
    }))
  }

  //****************** END FINISH TRADE ********************


  //******************* DENY BOOK REQUEST **********************

  function onDenyRequest(bookUserId, tradeId, callback){
    console.log("on deny request", bookUserId, tradeId);
    let url = urlBook + '/' + bookUserId + urlRequest + '/' + tradeId + urlDeny;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, denied) => {
      if (denied) {
        console.log(denied);
      }
      callback();
    }))
  }

  //****************** END DENY BOOK REQUEST ********************

  //******************* ACCEPT BOOK REQUEST **********************

  function onAcceptRequest(bookUserId, tradeId, callback){
    console.log("on accept request", bookUserId, tradeId);
    let url = urlBook + '/' + bookUserId + urlRequest + '/' + tradeId + urlAccept;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, accepted) => {
      if (accepted) {
        console.log(accepted);
      }
      callback();
    }))
  }

  //****************** END ACCEPT BOOK REQUEST ********************

})();
