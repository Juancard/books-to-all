'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var logger = require("morgan");
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var flash = require('connect-flash');

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// SETIING UP CLIENT SIDE
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js/jquery', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/bootstrap/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts')); // redirect CSS bootstrap

app.use(session({
	secret: 'secretBooksToAll',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//http headers on console
app.use(logger("dev")); // probar tambien con "combined"
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('views', '/app/views');
app.set('view engine', 'pug');
// req.user in all templates
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// Data to send to Routes files
var appEnv = {
  path: process.cwd(),
  middleware: {
    isLoggedIn: require("./middleware/isLoggedIn.js")
  },
  passport: passport
}

routes(app, appEnv);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
