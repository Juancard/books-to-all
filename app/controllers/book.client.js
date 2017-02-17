'use strict';

(function () {
  let formAddBook = document.forms['addBookForm'];
  let btnSubmitBook = formAddBook.getElementsByTagName('BUTTON')[0];
  let urlSearchBooks = appUrl + '/books/search';

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
      console.log(books[0].best_book.title);
    });
  }

  formAddBook.addEventListener("submit", onAddBook);
})();
