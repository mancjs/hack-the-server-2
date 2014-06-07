var express = require('express');

var auth = express.basicAuth(function(user, pass) {
  return user === 'admin' && pass === '114797';
});

module.exports = auth;