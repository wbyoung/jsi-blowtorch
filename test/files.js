var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('..');

describe('files', function() {
  it('works with files', function(done) {
    var fixture = path.join(__dirname, 'fixtures/a.txt');
    var expected = path.join(__dirname, 'expected/a.txt');
    lib.processFile(fixture, function(err, processed) {
      fs.readFile(expected, { encoding: 'utf8'}, function(err, contents) {
        expect(processed).to.eql(contents.trim());
        done();
      });
    });
  });
});
