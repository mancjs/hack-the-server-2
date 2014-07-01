var db = require('../lib/db');
var events = require('../lib/events');
var verifier = require('../lib/email-verifier');

var killTeamIn = function(id, seconds) {
  setTimeout(function() {
    db.killTeam(id, false);
  }, seconds * 1000);
};

var register = function(req, res) {
  var response = db.completeChallenge1(req.body && req.body.name, req.body && req.body.email);

  if (response.error) {
    return res.json(response);
  }

  verifier.send(req.body.email, response.id, function(err) {
    killTeamIn(response.id, 10 * 60);
    events.add(response, 'Welcome to the game');

    if (err) {
      console.log('Error: failed to send verification email to: ' + req.body.email + ' (' + response.id + ')');

      return res.json({
        msg: 'team ' + response.name + ' created. You must validate your team within 10 minutes.',
        instructions: verifier.generateChallenge2Code(response.id)
      });
    }

    return res.json({ msg: 'team ' + response.name + ' created, check your email. You must validate your team within 10 minutes.' });
  });
};

var routes = function(app) {
  app.get('/1995', function(req, res) {
    return res.json({ error: 'do you normally make GET requests to create an account? ;)' });
  });

  app.post('/1995', function(req, res) {
    return res.json({ error: 'who said anything about base 10?' });
  });

  app.get(/^(\/7cb|\/7CB|\/0x7cb|\/0x7CB)$/, function(req, res) {
    return res.json({ error: 'do you normally make GET requests to create an account? ;)' });
  });

  app.post(/^(\/7cb|\/7CB|\/0x7cb|\/0x7CB)$/, function(req, res) {
    return register(req, res);
  });
};

module.exports = routes;
