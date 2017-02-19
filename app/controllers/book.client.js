'use strict';

(function () {
  let formAddBook = document.forms['addBookForm'];
  let btnSubmitBook = formAddBook.getElementsByTagName('BUTTON')[0];
  let bookContainer = document.getElementsByClassName('books')[0];
  let bookTemplate = document.getElementById('book-template').firstChild;

  let urlSearchBooks = appUrl + '/books/search';
  let urlAddBook = appUrl + '/books/add';

  ajaxFunctions.ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

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

  formAddBook.addEventListener("submit", onAddBook);

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

  function addBookElement(userBook){
    console.log(userBook);
    let newBookElement = bookTemplate.cloneNode(true);

    let classBook = newBookElement.getElementsByClassName('book')[0];
    //tooltip title, not book title
    classBook.title = userBook.book.title + " by " + userBook.book.author;

    let linkBook = classBook.getElementsByTagName('A')[0];
    linkBook.href = userBook.imageUrl || userBook.book.imageUrl;

    let imageBook = linkBook.getElementsByTagName('IMG')[0];
    imageBook.alt = "book-" + userBook.book.title;
    imageBook.src = userBook.imageUrl || userBook.book.imageUrl;

    bookContainer.insertBefore(newBookElement, bookContainer.firstChild);
  }
})();
