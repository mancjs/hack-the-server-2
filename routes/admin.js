var db = require('../lib/db');
var basicAuth = require('./middleware/basic-auth');

var routes = function(app) {
  app.get('/admin', basicAuth, function(req, res) {
    return res.json(db.getTeams());
  });

  app.get('/admin/kill/:id', basicAuth, function(req, res) {
    db.killTeam(req.param('id'), true);
    return res.redirect('/admin');
  });

  app.get('/admin/registration/enable', basicAuth, function(req, res) {
    return res.json(db.enableRegistration());
  });

  app.get('/admin/registration/disable', basicAuth, function(req, res) {
    return res.json(db.disableRegistration());
  })
};

module.exports = routes;
