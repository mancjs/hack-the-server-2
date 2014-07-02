var db = require('../lib/db');
var events = require('../lib/events');
var throttle = require('../lib/throttle');
var sandbox = require('../lib/sandbox/sandbox');

var routes = function(app) {
  app.get('/final-challenge', function(req, res) {
    var team = db.getTeam(req.param('id'));

    return res.render('challenge8-readme', {
      teamExists: !!team,
      wrongStage: team && team.stage < 7,
      showInstructions: team && team.stage === 7,
      teamWithYourKey: team && team.teamWithKey
    });
  });

  app.post('/final-challenge', function(req, res) {
    if (db.teamIsSabotaged(req.param('id'))) {
      return res.json({ error: 'you have been sabotaged – you are blocked for 10 minutes' });
    }

    if (!req.param('id')) {
      return res.json({ error: 'you must think I\'m psychic – without an id I have no idea who you are' });
    }

    if (!req.param('script')) {
      return res.json({ error: 'if you\'re trying to send me a script, how about a value for the \'script\' parameter?' });
    }

    var team = db.getTeam(req.param('id'));

    if (!team) {
      return res.json({ error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' });
    }

    var test = {
      script: req.param('script'),
      output: undefined,
      key: team.key
    };

    sandbox.run(test, req.param('id'), function(err, valid, logs) {
      if (err) {
        return res.json({ error: err });
      }

      return res.json({ output: logs });
    });
  });

  app.post('/finish', function(req, res) {
    if (!req.param('id')) {
      return res.json({ error: 'you must think I\'m psychic – without an id I have no idea who you are' });
    }

    if (!req.param('key')) {
      return res.json({ error: 'you didn\'t specify a key to try' });
    }

    var throttled = throttle.isThrottled(req.param('id'));
    if (throttled) return res.json({ error: 'exceeded limit of 100 request per minute' });

    var response = db.completeFinalChallenge(req.param('id'), req.param('key'));
    if (response.error) return res.json(response);

    events.add(response, response.place ? ('Finished in ' + response.place + ' place') : 'Finished all challenges');

    var json = { msg: 'awesome – you completed all challenges' };

    if (response.place) {
      json.place = response.place;
    }

    return res.json(json);
  });
};

module.exports = routes;