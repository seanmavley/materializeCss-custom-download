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


function doReplace(oldString, newString, toFile) {
  // handles the replacement of the strings in
  // the 'toFile'
  console.log(toFile);
  replace({
    regex: oldString,
    replacement: newString,
    paths: [toFile],
    recursive: true,
    silent: true,
  });
}

function buildSass(destination, res) {
  sass.render({
    file: destination,
    includePaths: ['./public/vendor/materialize/sass/components/'],
    outputStyle: 'compressed'
  }, function(error, result) { // node-style callback from v3.0.0 onwards 
    if (error) {
      // console.log(error.status); 
      // console.log(error.column);
      console.log(error.message);
      console.log(error.line);
      res.render('index', { error: error.message, line: error.line });
    } else {
      // console.log(result.stats);
      res.set({
        'Content-Type': 'text/css',
        'Content-disposition': 'attachment; filename=custom-download.css'
      });
      houseCleaning(destination);
      return res.send(result.css);
    }
  });
}

function houseCleaning(destination) {
  fs.remove(destination, function(err) {
    if(err) return console.error(err);

    console.log('House cleaning done!');
  })
}

function doLoop(req, toFile) {
  for (key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      console.log('//' + key, '@import "' + 'components/' + key + '";');
      if (key === 'forms') {
        console.log('Forms were involved');
        // console.log('//' + key, '@import "' + 'components/' + key + '/' + key + '";');
        doReplace('//' + key, '@import "' + 'components/' + key + '/' + key + '";', toFile);
      }
      doReplace('//' + key, '@import "' + 'components/' + key + '";', toFile);
    }
  }
};

function newSassFile(req, res) {
  var filename = uuid.v1(); // a random generated file
  // store file in materialize folder
  // TODO: De-couple this vendor file from build
  // Might cause conflict during bower updates
  var destination = './public/vendor/materialize/sass/' + filename + '.scss';

  console.log('Copying begins');
  fs.copy('./public/vendor/materialize/sass/barebone.scss', destination, function(err) {
    if (err) return console.log(err);
    console.log('File created successfuly');
    // tucked in here because of race conditions. 
    // The tend to run before the copy happens.
    console.log('Looping begins');
    doLoop(req, destination);
    console.log('Sass building begins');
    buildSass(destination, res);
  });
}

app.post('/', function(req, res) {
  if (req.body.all === 'on') {
    console.log('Building for everything MaterializeCSS');
    buildSass('./public/vendor/materialize/sass/materialize.scss', res);
    return true;
  }
  // post object
  console.log(req.body);
  // Processes everything and returns a .css attachment file
  newSassFile(req, res);
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
}

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
console.log('Up and running at ' + port);
