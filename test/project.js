'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var lib = require('../lib');
var Project = require('../lib/project');
var temp = require('temp').track();

describe('Project', function() {
  beforeEach(function() {
    this.project = function() {
      return new Project(path.join(__dirname, 'fixtures/site-1'));
    };
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
    var project = this.project();
    var files = this.files;
    project._createFileList(function(err) {
      expect(err).to.not.exist;
      expect(project._files.sort()).to.eql(files);
      done();
    });
  });

  it('fails to find layouts before creating a file list', function() {
    var project = this.project();
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
    var project = this.project();
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
    var project = this.project();
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

  it('fails to read layouts before creating a layouts list', function() {
    var project = this.project();
    expect(function() {
      project._readLayouts();
    }).to.throw(Error);
  });

  it('reads layouts', function(done) {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._layouts = ['_layouts/blog.html', '_layouts/default.html'];
    project._readLayouts(function(err) {
      expect(err).to.not.exist;
      expect(_.size(project._layoutsCache)).to.eql(2);
      expect(project._layoutsCache.default.length).to.eql(106);
      expect(project._layoutsCache.blog.length).to.eql(122);
      done();
    })
  });

  it('fails to iterate pages before creating a pages list', function() {
    var project = this.project();
    expect(function() {
      project._eachPageAsync();
    }).to.throw(Error);
  });

  it('iterates pages', function(done) {
    var project = new Project(path.join(__dirname, 'fixtures/site-1'));
    project._pages = [
      '_pages/about.html',
      '_pages/blog.html',
      '_pages/blog/article.html',
      '_pages/index.html'
    ];
    var expectations = {
      about: {
        length: 6, config: { "vars": { "title": "About" } }
      },
      blog: {
        length: 5,
        config: { "layout": "blog", "vars": { "title": "Home" } }
      },
      article: {
        length: 21, config: { "layout": "blog", "vars":
          { "title": "Special Article" }
        }
      },
      index: {
        length: 14,
        config: {}
      }
    };
    var count = 0;
    project._eachPageAsync(function(page, eachDone) {
      var expectation = expectations[page.name];
      expect(page.config).to.eql(expectation.config);
      expect(page.contents.length).to.eql(expectation.length);
      expect(page.path).to.exist;
      count += 1;
      eachDone();
    }, function(err) {
      expect(err).to.not.exist;
      expect(count).to.eql(project._pages.length);
      done();
    });
  });

  it('creates individual pages', function(done) {
    var project = this.project();
    project._config = {};
    project._layoutsCache = { default: 'Hello {{ content }}' };
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'Article of some sort',
      config: {}
    };
    temp.mkdir('tmp', function(err, dir) {
      project._createPage(page, dir, function(err) {
        expect(err).to.not.exist;
        fs.exists(path.join(dir, 'blog/article.html'), function(exists) {
          expect(exists).to.be.true;
          temp.cleanup(function(err) {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });
  });

  it('requires layout cache to lay out pages', function() {
    var project = this.project();
    project._config = {};
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'Article of some sort',
      config: {}
    };
    expect(function() {
      project._applyLayout(page);
    }).to.throw('layouts cache must be created first');
  });

  it('requires project config to lay out pages', function() {
    var project = this.project();
    project._layoutsCache = { default: 'Hello' };
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'Article of some sort',
      config: {}
    };
    expect(function() {
      project._applyLayout(page);
    }).to.throw('config must be read first');
  });

  it('lays out pages', function() {
    var project = this.project();
    project._layoutsCache = { default: 'Hello {{ content }}' };
    project._config = {};
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'world',
      config: {}
    };

    expect(project._applyLayout(page)).to.eql('Hello world');
  });

  it('lays out pages with variables', function() {
    var project = this.project();
    project._layoutsCache = { default: '{{ title }}: Hello {{ content }}' };
    project._config = {};
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'world',
      config: { vars: { title: 'Title' } }
    };

    expect(project._applyLayout(page)).to.eql('Title: Hello world');
  });

  it('lays out pages with other layouts', function() {
    var project = this.project();
    project._layoutsCache = { blog: 'Blog, Hello {{ content }}' };
    project._config = {};
    var page = {
      name: 'article',
      path: '_pages/blog/article.html',
      contents: 'world',
      config: { layout: 'blog'  }
    };

    expect(project._applyLayout(page)).to.eql('Blog, Hello world');
  });

  it('requires misc files to copy them', function() {
    var project = this.project();
    expect(function() {
      project._copyMiscFiles();
    }).to.throw('misc files must be read first');
  });

  it('requires misc files to copy them', function(done) {
    var project = this.project();
    project._miscFiles = [
      'README.md',
      'css/styles.css'
    ];
    temp.mkdir('tmp', function(err, dir) {
      expect(err).to.not.exist;
      project._copyMiscFiles(dir, function(err) {
        expect(err).to.not.exist;
        fs.exists(path.join(dir, 'README.md'), function(exists) {
          expect(exists).to.be.true;
          fs.exists(path.join(dir, 'css/styles.css'), function(exists) {
            temp.cleanup(function(err) {
              expect(err).to.not.exist;
              done();
            });
          });
        });
      });
    });
  });
});
