'use strict';

var errorHandler = {
  onError: function onError(err){
    let m = document.getElementById('generalErrorMessage');
    let btn = m.getElementsByTagName('BUTTON')[0];
    btn.childNodes[1].textContent = " Error " + err.status + ": " + err.message;
    m.style.visibility = 'visible';
    m.focus();
  }
}
