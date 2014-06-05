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
});

