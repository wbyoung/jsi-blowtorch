'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('./async');
var fsExtras = require('./fs-extras');
var renderers = require('./renderers/all');

var Project = module.exports = function(root) {
  this._root = root;
  this._layoutsCache = undefined;
  this._layouts = undefined;
  this._pages = undefined;
  this._miscFiles = undefined;
  this._files = undefined;
  this._config = undefined;
};

Project.prototype.generate = function(dest, cb) {
  this._generate(dest, cb);
};

/**
 * Reads the global site config.
 *
 * @function
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._readConfig = function(cb) {
  fs.readFile(path.join(this._root, '_site.json'), function(err, contents) {
    this._config = contents ? JSON.parse(contents) : {};
    cb();
  }.bind(this));
};

/**
 * Read all project file paths
 *
 * @function
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._createFileList = function(cb) {
  fsExtras.readdirRecursive(this._root, function(err, files) {
    if (err) { return cb(err); }
    this._files = files;
    cb();
  }.bind(this))
};

/**
 * Generate a new site from the input project.
 *
 * @function
 * @param  {string}   dir  The destination directory
  * @param {function} cb   The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._generate = function(dir, cb) {
  this._createFileList(function(err) {
    if (err) { return cb(err); }

    this._findLayouts();
    this._findPages();
    this._findMiscFiles();

    this._readConfig(function(err) {
      this._readLayouts(function(err) {
        if (err) { return cb(err); }
        this._eachPageAsync(function(page, done) {
          this._createPage(page, dir, done);
        }.bind(this), function(err) {
          if (err) { return cb(err); }
          this._copyMiscFiles(dir, cb);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};


/**
 * Read all the layouts into `this._layoutsCache` keyed by the layout name, and
 * containing an object with the properties `path`, the layout's path and
 * `contents`, the layout's contents.
 *
 * @function
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._readLayouts = function(cb) {
  if (!this._layouts) { throw new Error('layouts must be read first'); }
  this._layoutsCache = {};
  async.each(this._layouts, function(layout, done) {
    var layoutPath = path.join(this._root, layout);
    var layoutName = path.basename(layout, path.extname(layout));
    fs.readFile(layoutPath, { encoding: 'utf8' }, function(err, contents) {
      if (err) { return done(err); }
      this._layoutsCache[layoutName] = { path: layoutPath, contents: contents };
      done();
    }.bind(this));
  }.bind(this), cb);
};


/**
 * Iterates through each page. Each page object will be represented as an
 * object with properties `name`, `path`, the relative path, `contents`, and
 * `config`.
 *
 * @function
 * @param  {function} iterator  Works like `async.each` iterator
 * @param  {function} cb        Works like `async.each` cb
 */
Project.prototype._eachPageAsync = function(iterator, cb) {
  if (!this._pages) { throw new Error('pages must be read first'); }

  async.each(this._pages, function(pageRelativePath, done) {
    var pageRelativeDirname = path.dirname(pageRelativePath);
    var pageName = path.basename(pageRelativePath, path.extname(pageRelativePath));
    var pagePath = path.join(this._root, pageRelativePath);
    var configPath = path.join(this._root, pageRelativeDirname, '_' + pageName + '.json');
    fs.readFile(pagePath, { encoding: 'utf8' }, function(err, contents) {
      if (err) { return done(err); }
      fs.readFile(configPath, { encoding: 'utf8' }, function(err, configContents) {
        var config = configContents ? JSON.parse(configContents) : {};
        var page = {
          name: pageName,
          path: pageRelativePath,
          contents: contents,
          config: config
        };
        iterator(page, done);
      }.bind(this));
    }.bind(this));
  }.bind(this), cb);
};

/**
 * Create a new page in the destination location
 *
 * @funciton
 * @param  {object}   page The page object
 * @param  {string}   dir  The destination directory
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._createPage = function(page, dir, cb) {
  var fileName = path.basename(page.path);
  var dirname = path.dirname(page.path)
    .split(path.sep).slice(1).join(path.sep);
  var fullDirPath = path.join(dir, dirname);
  var filePath = path.join(fullDirPath, fileName);
  var contents = this._applyLayout(page);

  fsExtras.mkdirp(fullDirPath, function(err) {
    if (err) { return cb(err); }
    fs.writeFile(filePath, contents, { encoding: 'utf8' }, cb);
  });
};


/**
 * Copy miscellaneous files to the destination location
 *
 * @funciton
 * @param  {string}  dir  The destination directory
 * @param {function} cb   The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._copyMiscFiles = function(dir, cb) {
  if (!this._miscFiles) { throw new Error('misc files must be read first'); }

  async.each(this._miscFiles, function(relativePath, done) {
    var srcPath = path.join(this._root, relativePath);
    var destPath = path.join(dir, relativePath);
    var destDir = path.dirname(destPath);
    fs.readFile(srcPath, { encoding: 'utf8' }, function(err, contents) {
      if (err) { return done(err); }
      fsExtras.mkdirp(destDir, function(err) {
        if (err) { return done(err); }
        fs.writeFile(destPath, contents, { encoding: 'utf8' }, done);
      });
    });
  }.bind(this), cb);
};

/**
 * Find layouts from the project.
 *
 * This collects all the layouts into `this._layouts` as objects containing the
 * property `contents`.
 */
Project.prototype._findLayouts = function() {
  if (!this._files) { throw new Error('files must be read first'); }
  this._layouts = this._files.filter(function(path) {
    return path.match(/^_layouts/);
  });
};


/**
 * Find pages from the project.
 *
 * This collects all the pages into `this._pages` as objects containing the
 * properties `config` and `contents`.
 */
Project.prototype._findPages = function() {
  if (!this._files) { throw new Error('files must be read first'); }
  this._pages = this._files.filter(function(path) {
    return path.match(/^_pages.*\.(html|haml)$/);
  });
};


/**
 * Find miscellaneous from the project.
 *
 * This collects all the miscellaneous files into `this._miscFiles` as objects
 * containing the property `contents`.
 */
Project.prototype._findMiscFiles = function() {
  if (!this._files) { throw new Error('files must be read first'); }
  this._miscFiles = this._files.filter(function(path) {
    return !path.match(/^_pages/) &&
      !path.match(/^_layouts/) &&
      !path.match(/^_site.json/);
  });
};

Project.prototype._renderer = function(filePath, contents, context) {
  var cls = renderers[path.extname(filePath).slice(1)];
  return new cls(contents, context);
};

/**
 * Uses the known layouts to create a new page based on the page's
 * configuration.
 */
Project.prototype._applyLayout = function(page) {
  if (!this._config) { throw new Error('config must be read first'); }
  if (!this._layoutsCache) { throw new Error('layouts cache must be created first'); }

  var context = _.extend({}, this._config.vars, page.config.vars);
  var layoutName = page.config.layout || this._config.layout || 'default';
  var layout = this._layoutsCache[layoutName];

  var renderer = this._renderer(page.path, page.contents, context);
  var contents = renderer.render();
  var layoutRenderer = this._renderer(layout.path, layout.contents,
    _.extend({}, context, { content: contents }));
  return layoutRenderer.render();
};
