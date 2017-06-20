var compression = require('compression');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var sass = require('node-sass');
var fs = require('fs-extra');
var replace = require('replace');
var uuid = require('node-uuid');
var helmet = require('helmet');
var nodemailer = require('nodemailer');
var config = require('./.config');
var transporter = nodemailer.createTransport(config);
var utils = require('./utilities');

var app = express();
app.use(compression());
app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/', function(req, res) {
  // if (req.body.minify === 'on')
  // if building everything materializecss
  if (req.body.all === 'on') {
    console.log('Building for everything MaterializeCSS');
    utils.buildSass('./public/vendor/materialize/sass/materialize.scss', res, true, utils.checkMinify(req));
    return true;
  } else {
    console.log(req.body);
    // Processes everything and returns a .css attachment file
    // based on selected inputs from user.
    utils.newSassFile(req, res);
    // newSassFile(req, res);
  }
});

app.get('/', function(req, res) {
  res.render('index', { title: 'MatCustom' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
};

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 3000;

app.listen(port);
console.log('Up and running at http://localhost:' + port);
