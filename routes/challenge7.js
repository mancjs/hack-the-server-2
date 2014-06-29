var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/challenge7', function(req, res) {
    var team = db.getTeam(req.param('id'));

    return res.render('challenge7-readme', {
      teamExists: !!team,
      wrongStage: team && team.stage < 6,
      showInstructions: team && team.stage >= 6
    });
  });

  app.post('/challenge7', function(req, res) {

  });
};

module.exports = routes;
