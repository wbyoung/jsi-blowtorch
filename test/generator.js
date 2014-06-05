var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('../lib');
var fsExtras = require('../lib/fs-extras');
var temp = require('temp').track();


describe('generator', function() {
  it.skip('generates sites', function(done) {
    var src = path.join(__dirname, 'fixtures/site-1');
    temp.mkdir('destination-site', function(err, dest) {
      lib.generator(src, dest, function(err) {
        fsExtras.directoriesEqual(dest, expected, function(err, result) {
          expect(err).to.not.be.defined;
          expect(result).to.be.true;
          temp.cleanup(function(err) {
            expect(err).to.not.be.defined;
            done();
          });
        });
      });
    });
  });
});
