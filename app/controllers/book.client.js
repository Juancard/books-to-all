'use strict';

(function () {

  ajaxFunctions.ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  //**************** ADD BOOK ***********************

  let formAddBook = document.forms['addBookForm'] || null;
  if (formAddBook) {
    let btnSubmitBook = formAddBook.getElementsByTagName('BUTTON')[0];

    let urlSearchBooks = appUrl + '/books/search';
    let urlAddBook = appUrl + '/books/add';

    let onAddBook = e => {
      e.preventDefault();
      btnSubmitBook.disabled = true;
      let url = urlSearchBooks + '?field=all&q=' + e.target.book.value;

      ajaxFunctions.ajaxRequest('GET', url, null, (err, data) => {
        btnSubmitBook.disabled = false;
        if (err) return errorHandler.onError(err);
        data = JSON.parse(data);
        let books = data.results.work;
        if (!books) return console.log("No books");

        // HARDCODE: CHOOSE BOOK ARBITRARIALY
        let bookChosen = books[0];
        addToUserBooks(bookChosen)
      });
    }
  }

  function addToUserBooks(bookChosen){
    let out = {
      book: bookChosen
    }
    ajaxFunctions.ajaxRequest('POST', urlAddBook, out, (err, data) => {
      if (err) return errorHandler.onError(err);
      data = JSON.parse(data);
      console.log(data);
      addBookElement(data);
    })
  }

  //**************** END ADD BOOK ***********************

  //**************** ADD BOOK ELEMENT ***********************

  const bookTemplate = document.getElementById('book-template').firstChild;
  const bookContainer = document.getElementsByClassName('books')[0].firstChild;

  function addBookElement(userBook){
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

  let onBooksActionClick = e => {
    if (e.target && e.target.nodeName === "BUTTON") {
      let buttonClicked = e.target;
      buttonClicked.disabled = true;
      let userBookId = buttonClicked.parentElement.getElementsByTagName('INPUT')[0].value
      let buttonValue = buttonClicked.value;

      if (buttonValue == 'remove') return removeUserBook(userBookId);
      if (buttonValue == 'toggleRequestable') return toggleRequestableUserBook(userBookId);
      if (buttonValue == 'request') return requestUserBook(userBookId);
    }
    e.stopPropagation();
  }

  for (let i=0; i<classesBookAction.length; i++)
    classesBookAction[i].addEventListener('click', onBooksActionClick, false);

  //**************** END ACTIONS FOR BOOK USER ****************

  //**************** REMOVE BOOK USER ***********************

  function removeUserBook(bookUserId){
    console.log("on remove user book", bookUserId);
  }

  //**************** END REMOVE BOOK USER ***********************

  //**************** SET BOOK USER AVAILABLE OR NOT *************

  function toggleRequestableUserBook(bookUserId){
    console.log("on toggle Requestable user book", bookUserId);
  }

  //*********** END SET BOOK USER AVAILABLE OR NOT *************

  //******************* REQUEST BOOK USER **********************

  function requestUserBook(bookUserId){
    console.log("on request user book", bookUserId);
  }

  //****************** END REQUEST BOOK USER ********************

})();
