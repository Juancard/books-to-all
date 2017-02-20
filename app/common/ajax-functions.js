'use strict';

var appUrl = window.location.origin;
var ajaxFunctions = {
   ready: function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   },
   ajaxRequest: function ajaxRequest (method, url, data, callback) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            callback(false, xmlhttp.response);
          } else {
            let err = new Error(xmlhttp.statusText);
            err.status = xmlhttp.status;
            callback(err);
          }
        }
      };

      xmlhttp.open(method, url, true);
      xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (data) {
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(data));
      } else {
        xmlhttp.send();
      }
   },

   onDataReceived: function onDataReceived(callback){
     return (err, data) => {
       if (err) {
         errorHandler.onError(err);
         return callback(err);
       }
       data = JSON.parse(data);
       if (data.message) errorHandler.onMessage(data.message);
       return callback(false, data.results);
     }
   }
};
