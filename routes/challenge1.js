var db = require('../lib/db');
var events = require('../lib/events');
var email = require('../lib/email');

var routes = function(app) {
  app.get('/1995', function(req, res) {
    return res.json({ error: 'do you normally make GET requests to create an account? ;)' });
  });

  app.post('/1995', function(req, res) {
    if (!db.isRegistrationEnabled()) return res.json({ error: 'sorry registration is closed :)' })

    var response = db.completeChallenge1(req.body && req.body.name, req.body && req.body.email);
    if (response.error) return res.json(response);

    email.send(req.body.email, response.id, function(err, resp) {
      if (err) return console.log(err);

      killTeamIn(response.id, 10 * 60);
      events.add(response, 'A Challenger Appears!');
    });

    return res.json({ msg: 'team ' + response.name + ' created, check your email. You must validate your team within 10 minutes' });
  });
};

var killTeamIn = function(id, seconds) {
  setTimeout(function() { db.killTeam(id, false); }, seconds * 1000);
};

module.exports = routes;