var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.post('/val1date/:teamId', function(req, res) {
    var response = db.completeChallenge2(req.param('teamId'));
    if (response.error) return res.json(response);

    events.add(response, 'Figured out how to register and made it to challenge 3!');
    return res.json({ msg: 'congratulations – just in time', nextUrl: '/challenge3' });
  });
};

module.exports = routes;