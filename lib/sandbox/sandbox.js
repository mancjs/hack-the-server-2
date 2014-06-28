var usage = require('usage');
var child = require('child_process');

var maxMemoryUsageMB = 100;

var run = function(test, callback) {
  var kill = function() {
    clearTimeout(timer);
    clearInterval(memoryWatcher);
    runner.kill();
  };

  var runner = child.fork(__dirname + '/runner');
  runner.send(test);

  var timer = setTimeout(function() {
    runner.kill();
    return callback('script took too long (5s)');
  }, 5000);

  var memoryWatcher = setInterval(function() {
    usage.lookup(runner.pid, function(err, result) {
      if (err) {
        clearInterval(memoryWatcher);
      }

      if (result) {
        if ((result.memory / 1024 / 1024) > maxMemoryUsageMB) {
          kill();
          return callback('memory usage too high');
        }
      }
    });
  }, 500);

  runner.on('message', function(result) {
    kill();
    return callback(result.err, result.valid);
  });
};

module.exports = {
  run: run
};