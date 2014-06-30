var _ = require('underscore');
var db = require('../lib/db');
var events = require('../lib/events');
var sandbox = require('../lib/sandbox/sandbox');

var routes = function(app) {
  app.get('/challenge7', function(req, res) {
    var team = db.getTeam(req.param('id'));

    return res.render('challenge7-readme', {
      teamExists: !!team,
      wrongStage: team && team.stage < 6,
      showInstructions: team && team.stage >= 6
    });
  });

  app.post('/challenge7', function(req, res) {
    if (!req.param('id')) {
      return res.json({ error: 'you must think I\'m psychic – without an id I have no idea who you are' });
    }

    if (!req.param('script')) {
      return res.json({ error: 'if you\'re trying to send me a script, how about a value for the \'script\' parameter?' });
    }

    var testParams = createTestParameters();

    var test = {
      script: req.param('script'),
      input: testParams.input,
      output: testParams.output
    };

    sandbox.run(test, req.param('id'), function(err, valid) {
      if (err) {
        return res.json({ error: err });
      }

      var response = db.completeChallenge7(req.param('id'), req.param('script').length);

      if (response.error) {
        return res.json(response);
      }

      events.add(response, 'Is now on the final challenge');

      return res.json({
        msg: 'you have made it to the final challenge',
        nextUrl: 'see /final-challenge?id=' + req.param('id') + ' for instructions'
      });
    });
  });
};

var createTestParameters = function() {
  var generateNumbers = function(amount) {
    return _.map(_.range(0, amount), function(number) {
      return Math.floor(Math.random() * 999) + 1;
    });
  };

  var createTestInput = function(numbers) {
    return _.map(numbers, function(number) {
      return number.toString(20);
    }).join(', ');
  };

  var createTestOutput = function(numbers) {
    var sortedNumbers = _.sortBy(numbers, function(number) {
      return number;
    }).reverse();

    return _.map(sortedNumbers, function(number) {
      return number.toString(20);
    }).join(', ');
  };

  var numbers = _.uniq(generateNumbers(10));

  return {
    input: createTestInput(numbers),
    output: createTestOutput(numbers)
  };
};

module.exports = routes;
