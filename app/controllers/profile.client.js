'use strict';

(function () {
  let passwordForm = document.forms["passwordForm"];
  let locationForm = document.forms["locationForm"];

  let btnSubmitPassword = passwordForm.getElementsByTagName('BUTTON')[0]
  let btnSubmitLocation = locationForm.getElementsByTagName('BUTTON')[0]

  let urlPassword = appUrl + "/profile/password";
  let urlLocation = appUrl + "/profile/location";

  let elementPasswordMessage = document.getElementById('passwordMessage');
  let elementLocationMessage = document.getElementById('locationMessage');

  let onSubmitPassword = e => {
    e.preventDefault();
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
  let onSubmitLocation = e => {
    e.preventDefault();
    btnSubmitLocation.disabled = true;
    let out = {
      city: locationForm.city.value,
      state: locationForm.state.value
    }
    ajaxFunctions.ajaxRequest('POST', urlLocation, out, (data) => {
      btnSubmitLocation.disabled = false;
      data = JSON.parse(data);
      if (data.message)
        showMessage(elementLocationMessage, data.message);
    });
  }

  passwordForm.addEventListener("submit", onSubmitPassword);
  locationForm.addEventListener("submit", onSubmitLocation);

  function showMessage(element, message) {
    // Clean element
    element.hidden = true;
    element.innerHTML = '';

    // color element depending on success or error
    let isSuccess = message.type == 'success';
    element.className = 'alert alert-' + ( (isSuccess)? 'success' : 'danger');

    // icon of the message
    let span = document.createElement("SPAN");
    span.className = "glyphicon glyphicon-" + ( (isSuccess)? 'ok' : 'remove')

    // message is setted into a text element
    let text = document.createTextNode(" " + message.value);

    // now element has the message inside
    element.appendChild(span);
    element.appendChild(text);

    element.hidden = false;
    helper.shake(element);
  }
})();
