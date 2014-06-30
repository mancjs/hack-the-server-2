var http = require('http');
var express = require('express');
var mustachex = require('mustachex');
var db = require('./lib/db');

var app = express();

app.configure(function() {
  app.engine('html', mustachex.express);
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

require('./routes/admin')(app);
require('./routes/events')(app);
require('./routes/dashboard')(app);
require('./routes/challenge1')(app);
require('./routes/challenge2')(app);
require('./routes/challenge3')(app);
require('./routes/challenge4')(app);
require('./routes/challenge5')(app);
require('./routes/challenge6')(app);
require('./routes/challenge7')(app);
require('./routes/challenge8')(app);
require('./routes/saboteur')(app);

http.createServer(app).listen(8808);
