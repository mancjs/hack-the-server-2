var fs = require('fs');
var db = require('../lib/db');
var events = require('../lib/events');
var sandbox = require('../lib/sandbox/sandbox');
var _ = require('underscore');

var routes = function(app) {
  app.get('/challenge5', function(req, res) {
    return res.render('challenge5-readme');
  });

  app.post('/challenge5', function(req, res) {
    if (!req.param('id')) {
      return res.json({ error: 'you must think I\'m psychic – without an id I have no idea who you are' });
    }

    if (!req.param('script')) {
      return res.json({ error: 'if you\'re trying to send me a script, how about a value for the \'script\' parameter?' });
    }

    var testParams = createTestParameters();

    var test = {
      script: req.param('script'),
      input: testParams.numbers,
      output: testParams.answers.join(', ')
    };

    sandbox.run(test, req.param('id'), function(err, valid) {
      if (err) {
        return res.json({ error: err });
      }

      if (usesModOperator(test.script)) {
        return res.json({ error: 'Oh, didn\'t I tell you? The mod operator (%) is banned. Sorry.' });
      }

      var response = db.completeChallenge5(req.param('id'));

      if (response.error) {
        return res.json(response);
      }

      events.add(response, 'Can taste victory – welcome to challenge 6');

      return res.json({
        msg: 'welcome to challenge 6!',
        nextUrl: 'hit /challenge6?id=' + req.param('id') + ' in your browser for instructions'
      });
    });
  });
};

var usesModOperator = function(script) {
  return script.match(/\%/g);
};

var createTestParameters = function() {
  var fizzBuzz = function(number) {
    var fizz = number % 3 === 0, buzz = number % 5 == 0;
    return fizz ? buzz ? 'FizzBuzz' : 'Fizz' : buzz ? 'Buzz' : number;
  };

  var generateNumbers = function(amount) {
    return _.map(_.range(0, amount), function(number) {
      return Math.floor(Math.random() * 50) + 1;
    });
  };

  var numbers = generateNumbers(10);

  return {
    numbers: numbers,
    answers: _.map(numbers, fizzBuzz)
  };
};

module.exports = routes;