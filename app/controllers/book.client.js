'use strict';

(function () {

  ajaxFunctions.ready(() => {
    callTooltip();
  });

  function callTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
  }

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

  const STATUS_COLOR = {
    traded: 'default',
    pending: 'info',
    accepted: 'primary',
    denied: 'danger',
    canceled: 'warning',
    finished: 'success'
  };

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
    const allBooksContainer = document.getElementsByClassName('books')[0].firstChild;

    function addBookElement(userBook){
      let toClear = document.getElementById('noBooks');
      if (toClear) toClear.outerHTML = '';

      let newBookElement = bookTemplate.cloneNode(true);
      newBookElement.id = userBook._id;

      let classBook = newBookElement.getElementsByClassName('book')[0];

      let tooltipTitle = userBook.book.title + " by " + userBook.book.author;
      classBook.setAttribute('data-toggle', 'tooltip');
      classBook.setAttribute('title', tooltipTitle);

      let linkBook = classBook.getElementsByTagName('A')[0];
      linkBook.href = userBook.imageUrl || userBook.book.imageUrl;

      let imageBook = linkBook.getElementsByTagName('IMG')[0];
      imageBook.alt = "book-" + userBook.book.title;
      imageBook.src = userBook.imageUrl || userBook.book.imageUrl;

      let classesBookAction = newBookElement.getElementsByClassName('action');
      Array.from(classesBookAction).forEach(addBookAction);

      allBooksContainer.insertBefore(newBookElement, allBooksContainer.firstChild);
      callTooltip();
    }

    //**************** END ADD BOOK ELEMENT ***********************

    // end if formAddBook
  }


  //**************** ACTIONS FOR BOOK USER ***********************

  let classesBookAction = document.getElementsByClassName('action');

  let onBooksActionClick = e => {

    let elementClicked = e.target;

    let bookContainer = helper.findAncestorByClass(elementClicked, 'bookContainer');
    let userBookId;
    if (bookContainer)
      userBookId = bookContainer.id;

    let tradeContainer = helper.findAncestorByClass(elementClicked, 'tradeContainer');
    let tradeId;
    if (tradeContainer)
      tradeId = tradeContainer.id;

    let clickedValue = elementClicked.getAttribute('value');

    elementClicked.disabled = true;
    let callback = (reload=false) => {
      elementClicked.disabled = false;
      // SUPER GIANT HARDCODE HERE!!
      // RELOADS PAGE, JUST TO NOT HAVE TO REFRESH
      // EVERY ELEMENT WITH NEW state
      // THIS IS WRONG AND SHOULD NEVER BE DONE
      if (reload) window.location.reload();
    }

    if (clickedValue == 'remove')
      return onRemoveUserBook(userBookId, callback);
    if (clickedValue == 'toggleRequestable')
      return onToggleRequestableUserBook(userBookId, callback);
    if (clickedValue == 'request')
      return onRequestUserBook(userBookId, callback);
    if (clickedValue == 'cancel')
      return onCancelRequest(userBookId, tradeId, callback);
    if (clickedValue == 'finish')
      return onFinishTrade(userBookId, tradeId, callback);
    if (clickedValue == 'deny')
      return onDenyRequest(userBookId, tradeId, callback);
    if (clickedValue == 'accept')
      return onAcceptRequest(userBookId, tradeId, callback);

  }

  let addBookAction = (classBookAction) => {
    classBookAction.addEventListener('click', onBooksActionClick, false);
  }

  for (let i=0; i<classesBookAction.length; i++)
    addBookAction(classesBookAction[i]);

  //**************** END ACTIONS FOR BOOK USER ****************

  //**************** REMOVE BOOK USER ***********************
  function onRemoveUserBook(bookUserId, callback){
    console.log("on remove user book");
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
    console.log("on toggle Requestable user book");
    let url = urlBook + '/' + bookUserId + urlToggle;
    ajaxFunctions.ajaxRequest('GET', url, null, ajaxFunctions.onDataReceived((err, toggled) => {
      if (toggled) {
        let bookElement = document.getElementById(toggled._id)
        let actionElements = bookElement.getElementsByClassName('action');
        for (let i=0; i<actionElements.length; i++){
          if (actionElements[i].getAttribute('value') == 'toggleRequestable'){
            let span = actionElements[i].getElementsByTagName('SPAN')[0];
            //HARDCODE: SHOULD ASK FOR STATE STRING 'UNAVAILABLE', NOT STATE NUMBER 3
            span.innerHTML = (toggled.state.state != 3)? "Yes" : "No";
          }
        }
      }
      callback();
    }))
  }

  //*********** END SET BOOK USER AVAILABLE OR NOT *************

  //******************* REQUEST BOOK USER **********************

  function onRequestUserBook(bookUserId, callback){
    console.log("on request user book");
    let url = urlBook + '/' + bookUserId + urlRequest;
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, requested) => {
      if (requested) {
        let bookElement = document.getElementById(requested.userBook._id);
        let elementToReplace = bookElement.querySelectorAll('[value="request"]')[0];
        changeState(elementToReplace, 'pending');
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
      callback(true);
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
      callback(true);
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
      callback(true);
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
      callback(true);
    }))
  }

  //****************** END ACCEPT BOOK REQUEST ********************


  function changeState(element, state){
    console.log("change element state", element, state);
    element.className = "btn btn-sm disabled btn-" + STATUS_COLOR[state];
    element.innerHTML = 'Trade is ' + helper.capitalizeFirstLetter(state);
    console.log("new element: ", element);
  }
})();
