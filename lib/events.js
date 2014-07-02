var events = [];

var add = function(team, message) {
  events.push({
    team: { name: team.name, gravatar: team.gravatar },
    message: message,
    saboteur: new Buffer('/saboteur_instructions').toString('base64')
  });
};

var getNext = function(index) {
  var ev = events[index];
  return ev ? ev : false;
};

module.exports = {
  add: add,
  getNext: getNext
};
