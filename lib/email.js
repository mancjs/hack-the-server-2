var mailer = require('nodemailer');

var smtp = mailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'mancjsbot@tomb.io',
    pass: 'mancjsbot'
  }
});

var createBody = function(key) {
  var body = '';
  body += 'Run the following code to get the next URL:\n\n';
  body += '<pre>var getNextUrl = function(teamId, algorithm) {\n';
  body += '  return [141, 354, 291, 324, 147, 300, 291, 348, 303, 141].map(algorithm).join(\'\') + teamId;\n';
  body += '};\n\n';
  body += 'var algorithm = function(number) {\n';
  body += '  // fix this\n';
  body += '  return String.fromCharCode(number);\n';
  body += '};\n\n'
  body += 'console.log(\'validate your team at: \' + getNextUrl("' + key + '", algorithm));\n</pre>';
  return body;
};

var send = function(to, key, callback) {
  var options = {
    from: 'Manc JS Bot <mancjsbot@tomb.io>',
    to: to,
    subject: 'Your registration key',
    html: createBody(key)
  };

  smtp.sendMail(options, function(err, resp) {
    callback(err, resp);
  });
};

module.exports = {
  send: send
};

// var createNumbers = function(string) {
//   var arr = [];
//   for (var i=0; i<string.length; i++) {
//     arr.push(string[i].charCodeAt(0) * 3);
//   }
//   return arr;
// };
