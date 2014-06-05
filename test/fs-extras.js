'use strict';

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var fsExtras = require('../lib/fs-extras');

describe('fs-extras', function() {
  it('can read directories recursively', function(done) {
    var dir = path.join(__dirname, 'fixtures/site-1');
    fsExtras.readdirRecursive(dir, function(err, result) {
      expect(err).to.not.be.defined;
      expect(result.sort()).to.eql([
        'README.md',
        '_layouts/blog.html',
        '_layouts/default.html',
        '_pages/_about.json',
        '_pages/_blog.json',
        '_pages/about.html',
        '_pages/blog.html',
        '_pages/blog/_article.json',
        '_pages/blog/article.html',
        '_pages/index.html',
        '_site.json',
        'css/styles.css'
      ]);
      done();
    });
  });

  describe('filesEqual()', function() {
    it('compares files as equal', function(done) {
      var file = path.join(__dirname, 'fixtures/site-1/README.md');
      fsExtras.filesEqual(file, file, function(err, result) {
        expect(err).to.not.be.defined;
        expect(result).to.be.true;
        done();
      });
    });

    it('compares files as not equal', function(done) {
      var file1 = path.join(__dirname, 'fixtures/site-1/README.md');
      var file2 = path.join(__dirname, 'fixtures/site-1/_site.json');
      fsExtras.filesEqual(file1, file2, function(err, result) {
        expect(err).to.not.be.defined;
        expect(result).to.be.false;
        done();
      });
    });

  });


  describe('directoriesEqual()', function() {
    it('compares directories as equal', function(done) {
      var dir = path.join(__dirname, 'fixtures/site-1');
      fsExtras.directoriesEqual(dir, dir, function(err, result) {
        expect(err).to.not.be.defined;
        expect(result).to.be.true;
        done();
      });
    });

    it('compares directories as not equal', function(done) {
      var dir1 = path.join(__dirname, 'fixtures/site-1');
      var dir2 = path.join(__dirname, 'fixtures/site-1/_pages');
      fsExtras.directoriesEqual(dir1, dir2, function(err, result) {
        expect(err).to.not.be.defined;
        expect(result).to.be.false;
        done();
      });
    });
  });
});

