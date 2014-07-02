var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.post('/val1date/:teamId', function(req, res) {
    if (db.teamIsSabotaged(req.param('teamId'))) {
      return res.json({ error: 'you have been sabotaged – you are blocked for 10 minutes' });
    }

    var response = db.completeChallenge2(req.param('teamId'));

    if (response.error) {
      return res.json(response);
    }

    events.add(response, 'Has completed challenge 2');
    return res.json({ msg: 'congratulations – just in time', nextUrl: 'hit /challenge3 in your browser' });
  });
};

module.exports = routes;