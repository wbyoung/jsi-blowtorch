'use strict';

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('../lib');
var Project = require('../lib/project');
var temp = require('temp').track();

describe('Project', function() {
  beforeEach(function() {
    this.project = new Project(path.join(__dirname, 'fixtures/site-1'));
    this.files = [
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
    ];
  });

  it('creates file list', function(done) {
    var project = this.project;
    var files = this.files;
    project._createFileList(function(err) {
      expect(err).to.not.exist;
      expect(project._files.sort()).to.eql(files);
      done();
    });
  });

  it('fails to find layouts before creating a file list', function() {
    var project = this.project;
    expect(function() {
      project._findLayouts();
    }).to.throw(Error);
  });

  it('finds layouts', function() {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._files = this.files;
    project._findLayouts();
    expect(project._layouts.sort()).to.eql([
      '_layouts/blog.html',
      '_layouts/default.html'
    ]);
  });

  it('fails to find pages before creating a file list', function() {
    var project = this.project;
    expect(function() {
      project._findPages();
    }).to.throw(Error);
  });

  it('finds pages', function() {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._files = this.files;
    project._findPages();
    expect(project._pages.sort()).to.eql([
      '_pages/about.html',
      '_pages/blog.html',
      '_pages/blog/article.html',
      '_pages/index.html'
    ]);
  });

  it('fails to find misc files before creating a file list', function() {
    var project = this.project;
    expect(function() {
      project._findMiscFiles();
    }).to.throw(Error);
  });

  it('finds misc files', function() {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._files = this.files;
    project._findMiscFiles();
    expect(project._miscFiles.sort()).to.eql([
      'README.md',
      'css/styles.css'
    ]);
  });

  it('reads the site config', function(done) {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._readConfig(function(err) {
      expect(err).to.not.exist;
      expect(project._config).to.eql({
        "vars": {
          "title": "My Website"
        }
      });
      done();
    });
  });
});
