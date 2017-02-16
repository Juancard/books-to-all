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

    //let apiURL = this.makeApiUrl(httpMethod, this.searchUrl, set_parameters);
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
  }
};

module.exports = apiBookHandler;