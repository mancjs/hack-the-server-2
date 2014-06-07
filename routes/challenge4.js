var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/challenge4', function(req, res) {
    return res.render('challenge4');
  });
};

module.exports = routes;
