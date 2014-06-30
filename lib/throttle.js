var moment = require('moment');
var _ = require('underscore');

var clients = [];
var maxRequestsPerMinute = 100;

var isThrottled = function(teamId) {
  var user = _.findWhere(clients, { teamId: teamId });

  if (!user) {
    user = {
      teamId: teamId,
      requests: 0,
      resets: moment().add('minutes', 1).toDate()
    };

    clients.push(user);
  }

  if (moment().toDate() >= user.resets) {
    user.requests = 0;
    user.resets = moment().add('minutes', 1).toDate();
  }

  user.requests += 1;

  return user.requests > maxRequestsPerMinute;
};

module.exports = {
  isThrottled: isThrottled
};
