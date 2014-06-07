var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/debug/114797', function(req, res) {
    return res.json(db.getTeams());
  });

  app.get('/debug/114797/kill/:id', function(req, res) {
    db.killTeam(req.param('id'), true);
    return res.redirect('/debug/114797');
  });

  app.get('/debug/114797/register/enable', function(req, res) {
    return res.json(db.enableRegistration());
  });

  app.get('/debug/114797/register/disable', function(req, res) {
    return res.json(db.disableRegistration());
  })
};

module.exports = routes;
