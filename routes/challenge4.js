var path = require('path');
var db = require('../lib/db');
var events = require('../lib/events');

var routes = function(app) {
  app.get('/challenge4', function(req, res) {
    return res.render('challenge4');
  });

  app.get('/challenge4-script', function(req, res) {
    return res.sendfile(path.join(__dirname, '../public/files/challenge4/script.min.js'));
  });

  app.post('/OXWOMyKXfktyqCfwwxQKMNzOiswuGTIABvPtgopPExUrnIuYpbUIxtScYGQQqUpBmkyXnXldwIGSusHHakQSUulsrC', function(req, res) {
    if (db.teamIsSabotaged(req.param('id'))) {
      return res.json({ error: 'you have been sabotaged – you are blocked for 10 minutes' });
    }

    var response = db.completeChallenge4(req.param('id'));

    if (response.error) {
      return res.json(response);
    }

    events.add(response, 'Has made it to challenge 5');

    return res.json({
      msg: 'welcome to challenge 5',
      nextUrl: 'post an implementation of FizzBuzz to /challenge5 (hit /challenge5 in your browser for more details)'
    });
  });
};

module.exports = routes;