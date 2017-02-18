'use strict';

(function () {
  let formAddBook = document.forms['addBookForm'];
  let btnSubmitBook = formAddBook.getElementsByTagName('BUTTON')[0];
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
      console.log("Book added: ", data);
    })
  }
})();
