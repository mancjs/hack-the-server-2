var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/challenge7', function(req, res) {
    var id = req.param('id');
    var team = db.getTeam(id);

    if (!team || team.stage < 6) {
      return res.json({ error: 'you need to complete challenge 6 first' });
    }

    return res.send('ok');
  });
};

module.exports = routes;
