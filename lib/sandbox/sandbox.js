var child = require('child_process');

var run = function(test, callback) {
  var runner = child.fork(__dirname + '/runner');

  runner.send(test);

  var timer = setTimeout(function() {
    runner.kill();
    return callback('script took too long (5s)');
  }, 5000);

  runner.on('message', function(result) {
    clearTimeout(timer);
    runner.kill();
    return callback(result.err, result.valid);
  });
};

module.exports = {
  run: run
};