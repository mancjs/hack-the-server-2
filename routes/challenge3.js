var db = require('../lib/db');
var events = require('../lib/events');
var sandbox = require('../lib/sandbox/sandbox');

var ABC = {
  toAscii: function(bin) {
    return bin.replace(/\s*[01]{8}\s*/g, function(bin) {
      return String.fromCharCode(parseInt(bin, 2))
    })
  },
  toBinary: function(str) {
    return str.replace(/[\s\S]/g, function(str) {
      str = ABC.zeroPad(str.charCodeAt().toString(2));
      return str + " "
    }).trim()
  },
  zeroPad: function(num) {
    return '00000000'.slice(String(num).length) + num
  }
};

var generateBinaryString = function() {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
  var string = '';

  for (var i=0; i<32; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }

  return {
    string: string,
    binary: ABC.toBinary(string)
  };
};

var routes = function(app) {
  app.get('/challenge3', function(req, res) {
    return res.render('challenge3-readme');
  });

  app.post('/challenge3', function(req, res) {
    if (!req.param('id')) {
      return res.json({ error: 'you must think I\'m psychic – without an id I have no idea who you are' });
    }

    if (!req.param('script')) {
      return res.json({ error: 'if you\'re trying to send me a script, how about a value for the \'script\' parameter?' });
    }

    var data = generateBinaryString();

    var test = {
      script: req.param('script'),
      input: data.binary,
      output: data.string
    };

    sandbox.run(test, req.param('id'), function(err, valid) {
      if (err) {
        return res.json({ error: err });
      }

      var response = db.completeChallenge3(req.param('id'));

      if (response.error) {
        return res.json(response);
      }

      events.add(response, 'Has JavaScript skills! Onwards to challenge 4!');

      return res.json({
        msg: 'nice job, onwards to challenge 4!',
        nextUrl: 'hit /challenge4 in your browser'
      });
    });
  });
};

module.exports = routes;
