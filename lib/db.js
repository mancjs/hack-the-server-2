var fs = require('fs');
var crypto = require('crypto');
var _ = require('underscore');
var events = require('./events');

var data = { teams: [] };
var dataFile = 'database';
var registrationEnabled = true;

var createId = function() {
  var id = (Math.round(Math.random() * 1000000000000)).toString(36);

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
  return 'http://www.gravatar.com/avatar/' + hash;
};

var save = function() {
  fs.writeFileSync(dataFile, JSON.stringify(data));
};

var load = function() {
  if (!fs.existsSync(dataFile)) return;
  data = JSON.parse(fs.readFileSync(dataFile));
  clean();
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
  if (!isRegistrationEnabled()) return res.json({ error: 'sorry registration is closed' });
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
  if (teamIsSabotaged(team)) return { error: 'you are currently sabotaged – wait 5 minutes' };

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
  if (teamIsSabotaged(team)) return { error: 'you are currently sabotaged – wait 5 minutes' };

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
  if (teamIsSabotaged(team)) return { error: 'you are currently sabotaged – wait 5 minutes' };

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
      return 'that is your own pairing-key – pass the pairing-key of the team you are working with';
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

      if (setAgo <= 5) {
        return 'you don\'t need to repeat yourself! ';
      }
    }

    team.remotePairingKey = pairingKey;
    team.remotePairingKeySet = new Date().getTime();
    save();
  };

  var matchPairingKeys = function(team, pairingKey) {
    var pairingTeam = _.findWhere(data.teams, { pairingKey: pairingKey });

    if (team.remotePairingKey && pairingTeam.remotePairingKey) {
      if (team.remotePairingKey === pairingTeam.pairingKey && pairingTeam.remotePairingKey === team.pairingKey) {
        var timeTaken = Math.floor(Math.abs(team.remotePairingKeySet - pairingTeam.remotePairingKeySet) / 1000);

        if (timeTaken > 3) {
          team.remotePairingKey = null;
          pairingTeam.remotePairingKey = null;
          team.pairingBannedUntil = new Date().getTime() + (5 * 60 * 1000);
          pairingTeam.pairingBannedUntil = new Date().getTime() + (5 * 60 * 1000);
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
  if (teamIsSabotaged(team)) return { error: 'you are currently sabotaged – wait 5 minutes' };

  var error = saveForeignPairingKey(team, pairingKey);
  if (error) return { error: error };

  var matchResult = matchPairingKeys(team, pairingKey);
  if (matchResult.error) return { error: matchResult.error };

  if (matchResult.matchFound) {
    matchResult.pairingTeam.stage = 6;
    team.stage = 6;
    save();

    events.add(matchResult.pairingTeam, 'Charges ahead to challenge 7!');
    events.add(team, 'Charges ahead to challenge 7!');
  }

  return { matchFound: matchResult.matchFound };
};

// var completeChallenge7 = function(id, key) {
//   if (!id) return { error: 'you must think I\'m psychic – without an id I have no idea who you are' };

//   var team = _.findWhere(data.teams, { id: id });
//   if (!team) return { error: 'I don\'t know who you stole that id from, but it doesn\'t refer to a team' };

//   if (team.key.toString() !== key) return { error: 'incorrect key' };

//   if (team.stage < 7) return { error: 'complete stage 6 first – cheater' };
//   if (team.stage >= 8) return { error: 'you are done :)' };
//   if (teamIsSabotaged(team)) return { error: 'you are currently sabotaged – wait 5 minutes' };

//   rankTeam(id);
//   save();
//   return team;
// };

var generateKey = function(team) {
  var key = createKey();
  var teamsWithoutKey = _.where(data.teams, { theirKey: undefined });

  var teams = _.reject(teamsWithoutKey, function(t) {
    return t.id === team.id;
  });

  var teamName;

  if (teams.length === 0) {
    team.theirKey = key;
    teamName = team.name;
  } else {
    var teamIndex = Math.floor(Math.random() * teams.length);
    teams[teamIndex].theirKey = key;
    teamName = teams[teamIndex].name;
  }

  team.key = key;
  team.teamWithKey = teamName;
  save();
  return teamName;
};

var rankTeam = function(id) {
  var team = _.findWhere(data.teams, { id: id });
  if (!team) return;

  var first = !!_.findWhere(data.teams, { place: '1st' });
  var second = !!_.findWhere(data.teams, { place: '2nd' });
  var third = !!_.findWhere(data.teams, { place: '3rd' });

  var result = !first ? { p: '1st', t: 'gold' } : !second ? { p: '2nd', t: 'silver' } : !third ? { p: '3rd', t: 'bronze' } : { p: '', t: '' };

  team.place = result.p;
  team.trophy = result.t;
  team.medal = result.p === '';

  team.stage = result.p === '1st' ? 100 : result.p === '2nd' ? 99 : result.p === '3rd' ? '98' : 97;
  save();
};

var makeTeamTheSaboteur = function(id) {
  var team = _.findWhere(data.teams, { id: id.trim() });
  if (!team) return 'could not find team for id ' + id + '\r\n';

  team.saboteur = true;
  save();

  events.add(team, 'Has become the saboteur');

  return '\r\nYou are now the saboteur\r\nGET /sabotage/92hgd6s/<team name> to use your sabotage against <team name>\r\nSabotaging a team causes them to be blocked from the server for 5 minutes\r\n\r\n';
};

var saboteurExists = function() {
  return _.some(data.teams, function(team) {
    return team.saboteur;
  });
};

var sabotageTeam = function(name) {
  var saboteur = _.findWhere(data.teams, { saboteur: true });
  if (!saboteur) return { error: 'nobody has become the saboteur' };

  if (saboteur.saboteurUsed) return { error: 'sabotage already used up' };

  var team = _.findWhere(data.teams, { name: name });
  if (!team) return { error: 'team not found' };

  team.sabotaged = true;
  team.sabotagedAt = new Date();
  saboteur.saboteurUsed = true;

  events.add(saboteur, 'Have sabotaged ' + team.name);

  save();
  return { msg: 'success – ' + team.name + ' are banned for the next 5 minutes' };
};

var teamIsSabotaged = function(team) {
  var fiveMinutes = 5 * 60 * 1000;

  if (team.sabotaged) {
    if (new Date() - team.sabotagedAt > fiveMinutes) {
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
  // completeChallenge7: completeChallenge7,
  generateKey: generateKey,
  rankTeam: rankTeam,
  makeTeamTheSaboteur: makeTeamTheSaboteur,
  saboteurExists: saboteurExists,
  sabotageTeam: sabotageTeam,
  killTeam: killTeam,
  enableRegistration: enableRegistration,
  disableRegistration: disableRegistration,
  isRegistrationEnabled: isRegistrationEnabled,
};
