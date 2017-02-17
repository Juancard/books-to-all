'use strict';

(function () {
  let passwordForm = document.forms["passwordForm"];
  let locationForm = document.forms["locationForm"];

  let btnSubmitPassword = passwordForm.getElementsByTagName('BUTTON')[0]
  let btnSubmitLocation = locationForm.getElementsByTagName('BUTTON')[0]

  let urlPassword = appUrl + "/profile/password";
  let urlLocation = appUrl + "/profile/location";

  let elementPasswordMessage = document.getElementById('passwordMessage');

  let onSubmitPassword = e => {
    e.preventDefault();
    elementPasswordMessage.hidden = true;
    btnSubmitPassword.disabled = true;
    let out = {
      newPassword: passwordForm.newPassword.value,
      currentPassword: passwordForm.currentPassword.value
    }
    ajaxFunctions.ajaxRequest('POST', urlPassword, out, (data) => {
      btnSubmitPassword.disabled = false;
      data = JSON.parse(data);
      if (data.message)
        showMessage(elementPasswordMessage, data.message);
    });
  }

  passwordForm.addEventListener("submit", onSubmitPassword);

  function showMessage(element, message) {
    // Clean element
    elementPasswordMessage.hidden = false;
    elementPasswordMessage.innerHTML = '';

    // color element depending on success or error
    let isSuccess = message.type == 'success';
    elementPasswordMessage.className = 'alert alert-' + ( (isSuccess)? 'success' : 'danger');

    // icon of the message
    let span = document.createElement("SPAN");
    span.className = "glyphicon glyphicon-" + ( (isSuccess)? 'ok' : 'remove')

    // message is setted into a text element
    let text = document.createTextNode(" " + message.value);

    // now element has the message inside
    elementPasswordMessage.appendChild(span);
    elementPasswordMessage.appendChild(text);
  }

})();
