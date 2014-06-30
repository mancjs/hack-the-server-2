var events = require('../lib/events');

var routes = function(app) {
  app.get('/event/:id', function(req, res) {
    var next = events.getNext(parseInt(req.param('id'), 10));
    return res.json(next);
  });
};

module.exports = routes;
