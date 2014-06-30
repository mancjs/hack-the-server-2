var moment = require('moment');
var db = require('../lib/db');
var _ = require('underscore');

var getTeamData = function() {
  var setMustacheStageKey = function(team) {
    _.each(_.range(1, 8), function(number) {
      team['stage' + number] = team.stage === number;
    });
  };

  var data = db.getTeams();

  _.each(data.teams, function(team) {
    setMustacheStageKey(team);
    team.name = team.name.substring(0, 20);

    if (!team.valid) {
      var timeLeft = 10 - moment().diff(team.created, 'minutes');
      team.validationTimeLeft = 'T-' + timeLeft + ' min' + (timeLeft !== 1 ? 's' : '');
    }
  });

  var teams = _.sortBy(data.teams, function(team) {
    return team.stage;
  }).reverse();

  var midPoint = Math.max(Math.ceil(teams.length / 2), 3);

  var response = {
    teamsLeft: teams.slice(0, midPoint),
    teamsRight: teams.slice(midPoint),
  };

  response.noTeams = !response.teamsLeft.length && !response.teamsRight.length;
  return response;
};

var routes = function(app) {
  app.get('/', function(req, res) {
    return res.render('dashboard');
  });

  app.get('/renderteams', function(req, res) {
    return res.render('teams', getTeamData());
  });

  app.get('/keys', function(req, res) {
    var data = db.getTeams();

    var team = _.findWhere(data.teams, { id: req.param('id') });
    var teamYouHaveTheKeyTo = _.findWhere(data.teams, { key: team && team.theirKey });

    return res.render('keys', {
      team: team,
      teamYouHaveTheKeyTo: teamYouHaveTheKeyTo
    });
  });
};

module.exports = routes;