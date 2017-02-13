'use strict';

// index.js:-
// This is the default file which gets loaded when you require the routes folder.
//Here  we export a func­tion which receives an app and appEnv objects as argu­ments.
// These argu­ments are then passed down to the indi­vid­ual route han­dler func­tions.

module.exports = function (app, appEnv) {

	require("./auth.js")(app, appEnv);
	require("./user.js")(app, appEnv);
	require("./books.js")(app, appEnv);
	require("./general.js")(app, appEnv);

};
