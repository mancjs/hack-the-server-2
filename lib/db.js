var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var _ = require('underscore');
var events = require('./events');

var data = { teams: [], challenge7ScriptLength: 0 };
var dataFile = 'database';
var registrationEnabled = true;

var createId = function() {
  var id = (Math.round(Math.random() * 10000000000)).toString(36);

  if (_.findWhere(data.teams, { id: id })) {
    return createId();
  }

  if (_.findWhere(data.teams, { pairingKey: id })) {
    return createId();
  }

  return id;
};

var createKey = function() {
  return Math.round(Math.random() * 9999);
};

var getGravatarUrl = function(email) {
  var hash = crypto.createHash('md5').update(email).digest('hex');
  return 'http://www.gravatar.com/avatar/' + hash + '?d=identicon';
};

var save = function() {
  fs.writeFileSync(dataFile, JSON.stringify(data));
};

var load = function() {
  if (!fs.existsSync(dataFile)) {
    setDefaultChallenge7ScriptLength();
    return;
  }

  data = JSON.parse(fs.readFileSync(dataFile));
  clean();

  if (!data.challenge7ScriptLength) {
    setDefaultChallenge7ScriptLength();
  }
};

var setDefaultChallenge7ScriptLength = function() {
  try {
    var defaultSolutionPath = path.join(__dirname, '../solutions/challenge7.js');
    data.challenge7ScriptLength = fs.readFileSync(defaultSolutionPath, 'utf-8').length;
  } catch (err) {
    data.challenge7ScriptLength = 9999;
  }
};

var clean = function() {
  data.teams = _.reject(data.teams, function(team) {
    return !team.valid;
  });

  save();
};

var killTeam = function(id, valid) {
  var team = _.findWhere(data.teams, { id: id, valid: false });

  if (team) {
    events.add(team, '¡Adiós! Be quicker next time!');
  }

  data.teams = _.reject(data.teams, function(team) {
    return team.id === id && team.valid === valid;
  });

  save();
};

var getTeam = function(id) {
  return _.findWhere(data.teams, { id: id });
};

var getTeams = function() {
  return data;
};

var completeChallenge1 = function(name, email) {
  if (!isRegistrationEnabled()) return { error: 'sorry registration is closed' };
  if (!name) return { error: 'a team needs a name, you know?' };
  if (!email) return { error: 'a team needs an email' };
  if (name.length <= 3) return { error: 'be more creative with your team name! (4 chars or more)' };
  if (name.length > 25) return { error: 'your team name is way too long! (25 chars or less)' };

  if (!name.match(/^[A-Za-z0-9_ ]+$/)) {
    return { error: 'team names must match /^[A-Za-z0-9_ ]+$/' };
  }

  var duplicate = _.some(data.teams, function(team) {
    return team.name.toLowerCase() === name.toLowerCase() || team.email.toLowerCase() === email.toLowerCase();
  });

  if (duplicate) {
    return { error: 'team already exists' };
  }

  var team = {
    id: createId(),
    name: name.trim(),
    email: email.trim(),
    gravatar: getGravatarUrl(email.trim()),
    pairingKey: createId(),
    created: new Date,
    valid: false,
    stage: 1
  };

  data.teams.push(team);
  save();
  return team;
};

var completeChallenge2 = function(id) {
  if (!id) return { error: 'no id, no validate' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'team does not exist, you were probably too slow – register again and move your ass' };
  if (team.valid) return { error: 'you are already validated' };

  team.valid = true;
  team.stage = 2;
  save();
  return team;
};

var completeChallenge3 = function(id) {
  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 2) return { error: 'complete stage 2 first – cheater' };
  if (team.stage >= 3) return { error: 'you have already completed this challenge' };

  team.stage = 3;
  save();
  return team;
};

var completeChallenge4 = function(id) {
  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 3) return { error: 'complete stage 3 first – cheater' };
  if (team.stage >= 4) return { error: 'you have already completed this challenge' };

  team.stage = 4;
  save();
  return team;
};

var completeChallenge5 = function(id) {
  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 4) return { error: 'complete stage 4 first – cheater' };
  if (team.stage >= 5) return { error: 'you have already completed this challenge' };

  team.stage = 5;
  save();
  return team;
};

var completeChallenge6 = function(id, pairingKey) {
  var saveForeignPairingKey = function(team, pairingKey) {
    var pairingTeam = _.findWhere(data.teams, { pairingKey: pairingKey });

    if (!pairingTeam) {
      return 'the pairing-key ' + pairingKey + ' does not exist';
    }

    if (pairingTeam.id === team.id) {
      return 'that is your own pairing-key – use the pairing-key of the team you are working with';
    }

    if (pairingTeam.stage < 5) {
      return 'you cannot exchange keys with this team because they are not at challenge 5 yet';
    }

    if (team.pairingBannedUntil && team.pairingBannedUntil > Date.now()) {
      var secondsLeft = Math.ceil((team.pairingBannedUntil - Date.now()) / 1000);
      return 'I am ignoring you for the next ' + secondsLeft + ' seconds';
    }

    if (pairingTeam.pairingBannedUntil && pairingTeam.pairingBannedUntil > Date.now()) {
      var secondsLeft = Math.ceil((team.pairingBannedUntil - Date.now()) / 1000);
      return 'I am ignoring you for the next ' + secondsLeft + ' seconds';
    }

    if (team.remotePairingKey === pairingKey) {
      var setAgo = Math.ceil((Date.now() - team.remotePairingKeySet) / 1000);

      if (setAgo <= 10) {
        return 'you don\'t need to repeat yourself!';
      }
    }

    team.remotePairingKey = pairingKey;
    team.remotePairingKeySet = Date.now();
    save();
  };

  var matchPairingKeys = function(team, pairingKey) {
    var pairingTeam = _.findWhere(data.teams, { pairingKey: pairingKey });

    if (team.remotePairingKey && pairingTeam.remotePairingKey) {
      if (team.remotePairingKey === pairingTeam.pairingKey && pairingTeam.remotePairingKey === team.pairingKey) {
        var timeTaken = Math.floor(Math.abs(team.remotePairingKeySet - pairingTeam.remotePairingKeySet) / 1000);

        if (timeTaken > 3) {
          team.remotePairingKey = null;
          team.remotePairingKeySet = null;
          team.pairingBannedUntil = Date.now() + (5 * 60 * 1000);

          pairingTeam.remotePairingKey = null;
          pairingTeam.remotePairingKeySet = null;
          pairingTeam.pairingBannedUntil = Date.now() + (5 * 60 * 1000);

          save();

          return {
            error: 'that was longer than 3s – both teams are now banned for 5 minutes',
            matchFound: false
          };
        }

        return { matchFound: true, pairingTeam: pairingTeam };
      }
    }

    return { matchFound: false };
  };

  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };
  if (!pairingKey) return { error: 'you need to pass the pairing-key of the team you are working with' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 5) return { error: 'complete stage 5 first – cheater' };
  if (team.stage >= 6) return { error: 'you have already completed this challenge' };

  var error = saveForeignPairingKey(team, pairingKey);
  if (error) return { error: error };

  var matchResult = matchPairingKeys(team, pairingKey);
  if (matchResult.error) return { error: matchResult.error };

  if (matchResult.matchFound) {
    matchResult.pairingTeam.stage = 6;
    team.stage = 6;
    save();

    events.add(matchResult.pairingTeam, 'Has just completed challenge 6');
    events.add(team, 'Has just completed challenge 6');
  }

  return { matchFound: matchResult.matchFound };
};

var completeChallenge7 = function(id, scriptLength) {
  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 6) return { error: 'complete stage 6 first – cheater' };
  if (team.stage >= 7) return { error: 'you have already completed this challenge' };

  if (scriptLength > data.challenge7ScriptLength) {
    return { error: 'Your solution is ' + scriptLength + ' chars, you need to match or beat ' + data.challenge7ScriptLength };
  }

  data.challenge7ScriptLength = scriptLength;
  generateKey(team);
  team.stage = 7;
  save();

  return team;
};

var completeFinalChallenge = function(id, key) {
  if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

  var team = _.findWhere(data.teams, { id: id });
  if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

  if (team.stage < 7) return { error: 'complete stage 7 first – cheater' };
  if (team.stage >= 8) return { error: 'you have already completed this challenge' };

  if (team.key.toString() !== key) return { error: 'incorrect key' };

  rankTeam(id);
  save();
  return team;
};

var generateKey = function(team) {
  var key = createKey();
  var teamsWithoutKey = _.where(data.teams, { theirKey: undefined });

  var teams = _.reject(teamsWithoutKey, function(t) {
    return t.id === team.id || t.place;
  });

  teams = _.sortBy(teams, function(t) {
    return t.stage;
  }).reverse();

  var teamName;

  if (teams.length === 0) {
    team.theirKey = key;
    teamName = team.name;
  } else {
    teams[0].theirKey = key;
    teamName = teams[0].name;
  }

  team.key = key;
  team.teamWithKey = teamName;
  save();
};

var getOrdinalSuffix = function(number) {
  var j = number % 10;
  var k = number % 100;

  if (j === 1 && k !== 11) {
     return number + 'st';
  }

  if (j === 2 && k !== 12) {
    return number + 'nd';
  }

  if (j === 3 && k !== 13) {
    return number + 'rd';
  }

  return number + 'th';
};

var rankTeam = function(id) {
  var getTrophy = function(place) {
    if (place === '1st') return 'gold';
    if (place === '2nd') return 'silver';
    if (place === '3rd') return 'bronze';

    return 'white';
  };

  var team = _.findWhere(data.teams, { id: id });

  if (!team) {
    return;
  }

  var totalFinished = _.where(data.teams, { finished: true }).length;

  team.finished = true;
  team.place = getOrdinalSuffix(totalFinished + 1);
  team.trophy = getTrophy(team.place);
  team.stage = 1000 - totalFinished;
  save();
};

var makeTeamTheSaboteur = function(id) {
  if (!id) {
    return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };
  }

  var team = _.findWhere(data.teams, { id: id });

  if (!team) {
    return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };
  }

  if (saboteurExists()) {
    return { error: 'you\'re too late – another team is already the saboteur' };
  }

  team.saboteur = true;
  save();

  events.add(team, 'Has become the saboteur');

  return {
    msg: 'you are now the saboteur!',
    details: 'at any point you may sabotage another team, causing them to be banned from the server for 10 mins',
    instructions: 'POST to /sabotage with your team <id> and the <name> of the team you want to sabotage'
  }
};

var saboteurExists = function() {
  return _.some(data.teams, function(team) {
    return team.saboteur;
  });
};

var sabotageTeam = function(id, name) {
  var team = _.findWhere(data.teams, { id: id });

  if (!team) {
    return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };
  }

  if (!team.saboteur) {
    return { error: 'nice try, but you\'re not the saboteur' };
  }

  if (team.saboteurUsed) {
    return { error: 'you can only sabotage once' };
  }

  var teamToSabotage = _.findWhere(data.teams, { name: name });

  if (!teamToSabotage) {
    return { error: 'could not find the team with name: ' + name };
  }

  teamToSabotage.sabotaged = true;
  teamToSabotage.sabotagedAt = Date.now();
  team.saboteurUsed = true;
  save();

  events.add(team, 'Have sabotaged ' + teamToSabotage.name);

  return {
    msg: 'high five! ' + teamToSabotage.name + ' are banned for the next 10 minutes'
  };
};

var teamIsSabotaged = function(id) {
  var team = _.findWhere(data.teams, { id: id });

  if (!team) {
    return false;
  }

  var tenMinutes = 10 * 60 * 1000;

  if (team.sabotaged) {
    if (Date.now() - team.sabotagedAt > tenMinutes) {
      events.add(team, 'Are back in the game!');
      team.sabotaged = false;
      save();
    }
  }

  return team.sabotaged;
};

var enableRegistration = function() {
  return registrationEnabled = true;
}

var disableRegistration = function() {
  return registrationEnabled = false;
}

var isRegistrationEnabled = function() {
  return registrationEnabled;
}

load();

module.exports = {
  getGravatarUrl: getGravatarUrl,
  load: load,
  getTeam: getTeam,
  getTeams: getTeams,
  completeChallenge1: completeChallenge1,
  completeChallenge2: completeChallenge2,
  completeChallenge3: completeChallenge3,
  completeChallenge4: completeChallenge4,
  completeChallenge5: completeChallenge5,
  completeChallenge6: completeChallenge6,
  completeChallenge7: completeChallenge7,
  completeFinalChallenge: completeFinalChallenge,
  generateKey: generateKey,
  rankTeam: rankTeam,
  makeTeamTheSaboteur: makeTeamTheSaboteur,
  saboteurExists: saboteurExists,
  sabotageTeam: sabotageTeam,
  teamIsSabotaged: teamIsSabotaged,
  killTeam: killTeam,
  enableRegistration: enableRegistration,
  disableRegistration: disableRegistration,
  isRegistrationEnabled: isRegistrationEnabled,
};
