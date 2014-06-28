var mailer = require('nodemailer');

var smtp = mailer.createTransport('SMTP', {
  service: 'gmail',
  auth: {
    user: 'mancjs-bot@martinrue.com',
    pass: 'abcd1234'
  }
});

var generateChallenge2Code = function(key) {
  var body = '';

  body += 'Run the following code to get the next URL:\n\n';
  body += '<pre>var getNextUrl = function(teamId, algorithm) {\n';
  body += '  return [141, 354, 291, 324, 147, 300, 291, 348, 303, 141].map(algorithm).join(\'\') + teamId;\n';
  body += '};\n\n';
  body += 'var algorithm = function(number) {\n';
  body += '  // the current algorithm performs no transformation on `number`\n';
  body += '  // work out the correct transformation to perform\n';
  body += '  // note: a correct transformation would mean that the first character is a forward slash\n\n';
  body += '  return String.fromCharCode(number);\n';
  body += '};\n\n'
  body += 'console.log(\'validate your team at: \' + getNextUrl("' + key + '", algorithm));\n</pre>';

  return body;
};

var send = function(to, key, callback) {
  console.log('Verifier: sending email to: ' + to + ' (' + key + ')');

  var options = {
    from: 'MancJS Bot <mancjs-bot@martinrue.com>',
    to: to,
    subject: 'Your MancJS registration key',
    html: generateChallenge2Code(key)
  };

  smtp.sendMail(options, callback);
};

module.exports = {
  send: send,
  generateChallenge2Code: generateChallenge2Code
};

// var createNumbers = function(string) {
//   var arr = [];
//   for (var i=0; i<string.length; i++) {
//     arr.push(string[i].charCodeAt(0) * 3);
//   }
//   return arr;
// };
