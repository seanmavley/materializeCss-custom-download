var sass = require('node-sass');
var config = require('./.config');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config);
var uuid = require('node-uuid');
var fs = require('fs-extra');
var replace = require('replace');

// using 'self' in order to reference the functions 
// within the module.exports within the exports itself.

function sendErrorMail(status, message) {
  /*
    Send Error Email 
  */
  var mailOpts = {
    from: 'urgent@khophi.co',
    to: 'nkansahrexford@gmail.com',
    subject: status,
    text: message,
    html: message
  };

  transporter.sendMail(mailOpts, function(err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log('Error message sent');
    }
  })
};

var self = module.exports = {
  checkMinify: function(req) {
    /* User wants minification? 
    Check that here
    */
    // (req.body.minify === 'on') ? return true : return false;
    if (req.body.minify === 'on') {
      return true;
    } else {
      return false;
    }
  },

  doReplace: function(oldString, newString, toFile) {
    /*
      Takes a component .scss path as string, and replaces
      with on-the-fly generated string filename for building
      into CSS

      handles the replacement of the strings in the 'toFile'
    */

    console.log(toFile);
    replace({
      regex: oldString,
      replacement: newString,
      paths: [toFile],
      recursive: true,
      silent: true,
    });
  },

  buildSass: function(destination, res, isEverything, minify) {
    var doCompress = 'nested';

    // Was 'minify' selected?
    if (minify) {
      doCompress = 'compressed'; // option for minifying generated .css
    };

    sass.render({
      file: destination,
      includePaths: ['./public/vendor/materialize/sass/components/'],
      outputStyle: doCompress
    }, function(error, result) { // node-style callback from v3.0.0 onwards 
      if (error) {
        // console.log(error.status); 
        // console.log(error.column);
        console.log(error.message);
        console.log(error.line);

        // error message to 'nkansahrexford@gmail.com'
        sendErrorMail(error.status, error.message);

        res.render('index', { error: 'Something did not go right! The developer has been notified via immediate email.' });
      } else {
        // console.log(result.stats);
        res.set({
          'Content-Type': 'text/css',
          'Content-disposition': 'attachment; filename=custom-download.css'
        });

        // we want to run housecleaning ONLY when 
        // not everything is selected.
        if (!isEverything) self.houseCleaning(destination);
        return res.send(result.css);
      }
    });
  },

  houseCleaning: function(destination) {
    fs.remove(destination, function(err) {
      if (err) return console.error(err);

      console.log('House cleaning done!');
    })
  },

  doLoop: function(req, toFile) {
    console.log(req.body);

    for (key in req.body) {
      console.log(key);
      console.log(req.body[key]);

      if (req.body[key] !== undefined) {
        // don't bother about {'minify': 'on'} to 
        if (key === 'minify') {
          return 'Jumping minify';
        };

        console.log('//' + key, '@import "' + 'components/' + key + '";');

        if (key === 'forms') {
          console.log('Forms were involved');
          self.doReplace('//' + key, '@import "' + 'components/' + key + '/' + key + '";', toFile);
        };
        self.doReplace('//' + key, '@import "' + 'components/' + key + '";', toFile);
      }
    }
  },

  newSassFile: function(req, res) {
    var filename = uuid.v1(); // a random generated file
    // store file in materialize folder
    // TODO: De-couple this vendor file from build
    // Might cause conflict during bower updates
    var destination = './public/vendor/materialize/sass/' + filename + '.scss';
    console.log(destination);

    console.log('Copying begins');
    fs.copy('./public/vendor/materialize/sass/barebone.scss', destination, function(err) {
      if (err) return console.log(err);
      console.log('File created successfuly');
      // tucked in here because of race conditions. 
      // The tendency to run before the copy happens.
      console.log('Looping begins');
      self.doLoop(req, destination);
      console.log('Sass building begins');
      self.buildSass(destination, res, false, self.checkMinify(req));
    });
  }
}
