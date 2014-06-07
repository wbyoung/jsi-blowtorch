'use strict';

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('../lib');
var fsExtras = require('../lib/fs-extras');
var temp = require('temp').track();

describe('generator', function() {
  it('generates sites', function(done) {
    var src = path.join(__dirname, 'fixtures/site-basic');
    var expected = path.join(__dirname, 'expected/site-basic');
    temp.mkdir('destination-site', function(err, dest) {
      expect(err).to.not.exist;
      lib.generate(src, dest, function(err) {
        expect(err).to.not.exist;
        fsExtras.directoriesEqual(dest, expected, function(err, result) {
          expect(err).to.not.exist;
          expect(result).to.be.true;
          temp.cleanup(function(err) {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });
  });
});
