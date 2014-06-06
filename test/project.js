'use strict';

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('../lib');
var Project = require('../lib/project');
var temp = require('temp').track();

describe('Project', function() {
  before(function() {
    this.project = new Project(path.join(__dirname, 'fixtures/site-1'));
  });

  it('creates file list', function(done) {
    var project = this.project;
    project._createFileList(function(err) {
      expect(err).to.not.exist;
      expect(project._files.sort()).to.eql([
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

  it('fails to find layouts before creating a file list', function() {
    var project = this.project;
    expect(function() {
      project._findLayouts();
    }).to.throw;
  });

  it('finds layouts', function(done) {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._createFileList(function(err) {
      project._findLayouts();
      expect(project._layouts.sort()).to.eql([
        '_layouts/blog.html',
        '_layouts/default.html'
      ]);
      done();
    });
  });

  it('fails to find pages before creating a file list', function() {
    var project = this.project;
    expect(function() {
      project._findPages();
    }).to.throw;
  });

  it('finds pages', function(done) {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._createFileList(function(err) {
      project._findPages();
      expect(project._pages.sort()).to.eql([
        '_pages/about.html',
        '_pages/blog.html',
        '_pages/blog/article.html',
        '_pages/index.html',
      ]);
      done();
    });
  });
});
