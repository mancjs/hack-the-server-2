var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/saboteur_instructions', function(req, res) {
    if (db.saboteurExists()) {
      return res.json({ error: 'you are too late – another team is already the saboteur' });
    }

    return res.render('saboteur');
  });

  app.post('/-00', function(req, res) {
    return res.json(db.makeTeamTheSaboteur(req.param('id')));
  });

  app.post('/sabotage', function(req, res) {
    return res.json(db.sabotageTeam(req.param('id'), req.param('name')));
  });
};

module.exports = routes;