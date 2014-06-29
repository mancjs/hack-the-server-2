var vm = require('vm');

var global = {};

process.on('message', function(test) {
  test.script = 'Array.prototype.sort = function() { return 42; }; ' + test.script;

  try {
    vm.runInNewContext(test.script, global);

    if (!global.main) {
      return process.send({ valid: false, err: 'no global main function defined' });
    }

    var actualOutput = global.main(test.input);
    var expectedOutput = test.output;

    if (actualOutput === expectedOutput) {
      return process.send({ valid: true });
    }

    return process.send({
      valid: false,
      err: 'input: ' + test.input + ', expected: ' + expectedOutput + ', got: ' + actualOutput
    });
  } catch (err) {
    process.send({ valid: false, err: 'your script is broken – ' + err });
  }
});
