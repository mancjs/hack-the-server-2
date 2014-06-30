var db = require('../lib/db');
var events = require('../lib/events');
var basicAuth = require('./middleware/basic-auth');

var raiseEvent = function(message) {
  events.add({
    name: 'MancJS Bot',
    gravatar: db.getGravatarUrl('mancjs@martinrue.com')
  }, message);
};

var routes = function(app) {
  app.get('/admin', basicAuth, function(req, res) {
    return res.json(db.getTeams());
  });

  app.get('/admin/kill/:id', basicAuth, function(req, res) {
    db.killTeam(req.param('id'), true);
    return res.redirect('/admin');
  });

  app.get('/admin/registration/enable', basicAuth, function(req, res) {
    raiseEvent('Registration is now open');
    return res.json(db.enableRegistration());
  });

  app.get('/admin/registration/disable', basicAuth, function(req, res) {
    raiseEvent('Registration is now closed');
    return res.json(db.disableRegistration());
  })
};

module.exports = routes;
