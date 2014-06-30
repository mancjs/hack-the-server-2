var sandbox = require('../lib/sandbox/sandbox');

describe('sandbox', function() {
  var teamId = 0;

  it('is valid if output matches expected', function(done) {
    var test = {
      script: 'function main(input) { return input; }',
      input: '123',
      output: '123'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toBeFalsy();
      expect(valid).toBeTruthy();
      done();
    });
  });

  it('returns error if output does not match expected', function(done) {
    var test = {
      script: 'function main(input) { return "abc"; }',
      input: '123',
      output: '123'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('input: 123, expected: 123, got: abc');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('returns an error if code is empty', function(done) {
    var test = {
      script: ''
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('no global main function defined');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('returns an error if code is invalid', function(done) {
    var test = {
      script: '...'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('your script is broken – SyntaxError: Unexpected token .');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('returns an error if no global main function is found', function(done) {
    var test = {
      script: 'var app = function() { };'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('no global main function defined');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('kills scripts that take longer than 5 seconds', function(done) {
    var test = {
      script: 'var main = function() { while (true); };'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('script took too long');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('kills scripts that try to fill up memory', function(done) {
    var test = {
      script: 'var main = function() { var arr = []; while (true) { arr.push("...."); } };'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('memory usage too high');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('kills scripts that recurse too much', function(done) {
    var test = {
      script: 'var main = function() { return main(); };'
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(err).toMatch('your script is broken');
      expect(valid).toBeFalsy();
      done();
    });
  });

  it('prevents scripts being run more than once per 5s', function(done) {
    var test = {
      script: 'var main = function(input) { return input; };',
      input: '10',
      output: '10'
    };

    var team = 'some-team-id';

    sandbox.run(test, team, function(err, valid) {
      expect(valid).toBeTruthy();

      sandbox.run(test, team, function(err, valid) {
        expect(err).toMatch('there must be 5s between each script run');
        expect(valid).toBeFalsy();
        done();
      });
    });
  });

  it('disables the use of Array.prototype.sort in scripts', function(done) {
    var test = {
      script: 'var main = function() { return [].sort(function(){}); };',
      input: '...',
      output: 42
    };

    sandbox.run(test, teamId++, function(err, valid) {
      expect(valid).toBeTruthy();
      done();
    });
  });

  it('captures and returns console.log calls when valid', function(done) {
    var test = {
      script: 'var main = function() { for (var i=0; i<10; i++) { console.log(i); } return 42; };',
      input: '...',
      output: 42
    };

    sandbox.run(test, teamId++, function(err, valid, logs) {
      expect(valid).toBeTruthy();
      expect(logs.length).toEqual(10);
      expect(logs[0]).toEqual('0');
      expect(logs[9]).toEqual('9');
      done();
    });
  });

  it('captures and returns console.log calls when invalid', function(done) {
    var test = {
      script: 'var main = function() { for (var i=0; i<10; i++) { console.log(i); } };',
      input: '...',
      output: 42
    };

    sandbox.run(test, teamId++, function(err, valid, logs) {
      expect(valid).toBeFalsy();
      expect(logs.length).toEqual(10);
      expect(logs[0]).toEqual('0');
      expect(logs[9]).toEqual('9');
      done();
    });
  });

  it('does not have a higherOrLower function if the test contains no key', function(done) {
    var test = {
      script: 'var main = function() { higherOrLower(); };',
      input: '...',
      output: '...'
    };

    sandbox.run(test, teamId++, function(err, valid, logs) {
      expect(valid).toBeFalsy();
      expect(err).toMatch('ReferenceError: higherOrLower is not defined');
      done();
    });
  });

  it('has a higherOrLower function if the test contains a key', function(done) {
    var test = {
      script: 'var main = function() { higherOrLower(); return 42; };',
      input: '...',
      output: 42,
      key: 123
    };

    sandbox.run(test, teamId++, function(err, valid, logs) {
      expect(valid).toBeTruthy();
      done();
    });
  });

  it('the higherOrLower function gives back the correct higher, lower or equal responses', function(done) {
    var test = {
      script: 'var main = function() { console.log(higherOrLower(1000)); console.log(higherOrLower(1)); console.log(higherOrLower(123)); return 42; };',
      input: '...',
      output: 42,
      key: 123
    };

    sandbox.run(test, teamId++, function(err, valid, logs) {
      expect(valid).toBeTruthy();
      expect(logs[0]).toMatch('lower');
      expect(logs[1]).toMatch('higher');
      expect(logs[2]).toMatch('equal');
      done();
    });
  });
});
