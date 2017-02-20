'use strict';

(function () {

  ajaxFunctions.ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  //**************** ADD BOOK ***********************
  let urlSearchBooks = appUrl + '/books/search';
  let urlAddBook = appUrl + '/books/add';
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

  }

  function addToUserBooks(bookChosen){
    let out = {
      book: bookChosen
    }
    ajaxFunctions.ajaxRequest(
      'POST',
      urlAddBook,
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
    toClear.outerHTML = '';

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

  //**************** ACTIONS FOR BOOK USER ***********************

  let classesBookAction = document.getElementsByClassName('bookAction');
  let urlBook = appUrl + '/books';

  let onBooksActionClick = e => {
    if (e.target && e.target.nodeName === "BUTTON") {
      let buttonClicked = e.target;
      let userBookId = buttonClicked.parentElement.getElementsByTagName('INPUT')[0].value
      let buttonValue = buttonClicked.value;

      if (buttonValue == 'remove')
        return onRemoveUserBook(userBookId);
      if (buttonValue == 'toggleRequestable')
        return onToggleRequestableUserBook(userBookId);
      if (buttonValue == 'request')
        return onRequestUserBook(userBookId);
    }
    e.stopPropagation();
  }

  for (let i=0; i<classesBookAction.length; i++)
    classesBookAction[i].addEventListener('click', onBooksActionClick, false);

  //**************** END ACTIONS FOR BOOK USER ****************

  //**************** REMOVE BOOK USER ***********************
  function onRemoveUserBook(bookUserId){
    console.log("on remove user book", bookUserId);
    let url = urlBook + '/' + bookUserId + '/remove';
    ajaxFunctions.ajaxRequest('DELETE', url,
      null, ajaxFunctions.onDataReceived(
        (err, removed) => {
          if (!removed) return;
          console.log(removed);
        }
      )
    )
  }

  //**************** END REMOVE BOOK USER ***********************

  //**************** SET BOOK USER AVAILABLE OR NOT *************

  function onToggleRequestableUserBook(bookUserId){
    console.log("on toggle Requestable user book", bookUserId);
    let url = urlBook + '/' + bookUserId + '/toggleRequestable';
    ajaxFunctions.ajaxRequest('GET', url, null, ajaxFunctions.onDataReceived((err, toggled) => {
      if (!toggled) return;
      console.log(toggled);
    }))
  }

  //*********** END SET BOOK USER AVAILABLE OR NOT *************

  //******************* REQUEST BOOK USER **********************

  function onRequestUserBook(bookUserId){
    console.log("on request user book", bookUserId);
    let url = urlBook + '/' + bookUserId + '/request';
    ajaxFunctions.ajaxRequest('POST', url, null, ajaxFunctions.onDataReceived((err, requested) => {
      if (!requested) return;
      console.log(requested);
    }))
  }

  //****************** END REQUEST BOOK USER ********************

})();
