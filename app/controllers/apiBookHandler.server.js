'use strict';

let request = require('request');
let qs = require('querystring');
let HttpVerror = require('http-verror');

function apiBookHandler() {
  this.searchUrl = 'https://www.goodreads.com/search/index.xml',
  this.key = process.env.GOODREADS_KEY,
  this.secret = process.env.GOODREADS_SECRET,

  this.searchRequest = (query, field, callback) => {
    /* The type of request */
    let httpMethod = 'GET';

    let params = {
      key: this.key,
      q: query,
      search: field,
      page: 1
    };
    let paramsUrl = qs.stringify(params);
    let apiURL = this.searchUrl + '?' + paramsUrl;
    console.log(apiURL);

    /* Then we use request to send make the API Request */
    request(apiURL, function(error, response, body){
      if (error) return callback(new HttpVerror.InternalError(error, 'calling books api'))
      return callback(false, response, body);
    });
  },

  this.getBookData = (bookGivenByApi) => {
    return {
      title: bookGivenByApi.best_book.title,
      author: bookGivenByApi.best_book.author.name,
      imageUrl: bookGivenByApi.best_book.image_url,
      goodreadsId: bookGivenByApi.id['$t'],
      publicationYear: bookGivenByApi.original_publication_year['$t'],
      averageRating: bookGivenByApi.average_rating
    }
  }
};

module.exports = apiBookHandler;
