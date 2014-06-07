var mailer = require('nodemailer');

var smtp = mailer.createTransport("SMTP", {
  service: "Gmail",
  auth: {
    user: "mancjsbot@tomb.io",
    pass: "mancjsbot"
  }
});

var send = function(to, key, callback) {
  var options = {
    from: "Manc JS Bot <mancjsbot@tomb.io>",
    to: to,
    subject: 'Your registration key',
    html: 'Your team id is <b>' + key + '</b> use it to validate your team.'
  };

  smtp.sendMail(options, function(err, resp) {
    callback(err, resp);
  });
};

module.exports = {
  send: send
};
