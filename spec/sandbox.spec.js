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
});
