var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.post('/val1date/:teamId', function(req, res) {
    var response = db.validateTeam(req.param('teamId'));
    if (response.error) return res.json(response);

    var nextUrl = new Buffer('/challenge2').toString('base64');
    events.add(response, 'Figured out how to register and made it to challenge 2!');
    return res.json({ msg: 'congratulations – just in time', nextUrl: nextUrl });
  });
};

module.exports = routes;