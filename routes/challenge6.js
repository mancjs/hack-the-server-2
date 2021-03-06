var db = require('../lib/db');

var routes = function(app) {
  app.get('/challenge6', function(req, res) {
    var id = req.param('id');
    var team = db.getTeam(id);

    return res.render('challenge6-readme', {
      id: id,
      teamExists: !!team,
      pairingKey: team ? team.pairingKey : ''
    });
  });

  app.post('/challenge6', function(req, res) {
    var id = req.param('id');
    var pairingKey = req.param('pairing-key');

    if (db.teamIsSabotaged(id)) {
      return res.json({ error: 'you have been sabotaged – you are blocked for 10 minutes' });
    }

    var response = db.completeChallenge6(id, pairingKey);

    if (response.error) {
      return res.json({ error: response.error });
    }

    if (response.matchFound) {
      return res.json({
        msg: 'just in time – both teams have made it to challenge 7'
      });
    } else {
      return res.json({
        msg: 'key accepted, better hope the other team move their ass'
      });
    }
  });
};

module.exports = routes;