'use strict';

var errorHandler = {
  onError: function onError(err){
    let message = "Error " + err.status + ": " + err.message;
    let m = createMessageElement(message);
    m.focus();
  },
  onMessage: function onMessage(message){
    let m = createMessageElement(message.text, message.type);
    m.focus();
  }
}

function createMessageElement(message, type='danger') {
  let toClean = document.getElementsByClassName('messageOnScreen');
  for (let i=0; i<toClean.length; i++) toClean[i].outerHTML = '';

  let divMessage = document.createElement('DIV');
  divMessage.className = "messageOnScreen alert alert-" + type + " alert-dismissable fade in";

  let linkClose = document.createElement('A');
  linkClose.href = "#";
  linkClose.className = "close";
  linkClose.setAttribute('data-dismiss', 'alert');
  linkClose.setAttribute('aria-label', 'close');
  linkClose.textContent = "×";

  let textElement = document.createTextNode(message);

  divMessage.appendChild(linkClose);
  divMessage.appendChild(textElement);
  document.body.appendChild(divMessage);

  return divMessage;
}
