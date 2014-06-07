var db = require('../lib/db');
var events = require('../lib/events');
var email = require('../lib/email');

var routes = function(app) {
  app.get('/1995', function(req, res) {
    return res.json({ error: 'do you normally make GET requests to create an account? ;)' });
  });

  app.post('/1995', function(req, res) {
    if (!db.isRegistrationEnabled()) return res.json({ error: 'sorry registration is closed :)' })

    var response = db.registerTeam(req.body && req.body.name, req.body && req.body.email);
    if (response.error) return res.json(response);

    email.send(req.body.email, response.id, function(err, resp) {
      if (err) return console.log(err);

      killTeamIn(response.id, 240);
      events.add(response, 'A Challenger Appears!');
    });

    return res.json({ msg: 'team ' + response.name + ' created, check your email. please validate your team within 240 seconds' });
  });

  app.post('/validate', function(req, res) {
    var response = db.validateTeam(req.body && req.body.id);
    if (response.error) return res.json(response);

    var nextUrl = new Buffer('/challenge2').toString('base64');
    events.add(response, 'Figured out how to register and made it to challenge 2!');
    return res.json({ msg: 'congratulations – just in time', nextUrl: nextUrl });
  });
};

var killTeamIn = function(id, seconds) {
  setTimeout(function() { db.killTeam(id, false); }, seconds * 1000);
};

module.exports = routes;
