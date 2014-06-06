'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('./async');
var fsExtras = require('./fs-extras');

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

    this._readLayouts(function(err) {
      if (err) { return cb(err); }
      this._eachPageAsync(function(page, done) {
        this._createPage(page, dir, done);
      }, function(err) {
        if (err) { return cb(err); }
        this._copyMiscFiles(dir, cb);
      });
    });
  });
};


/**
 * Read all the layouts into `this._layoutsCache` keyed by the layout name, and
 * containing the layout.
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
    var layoutName = path.basename(layout, '.html');
    fs.readFile(layoutPath, { encoding: 'utf8' }, function(err, content) {
      if (err) { return done(err); }
      this._layoutsCache[layoutName] = content;
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
    var pageName = path.basename(pageRelativePath, '.html');
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
    return path.match(/^_pages.*\.html$/);
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

/**
 * Uses the known layouts to create a new page based on the page's
 * configuration.
 */
Project.prototype._applyLayout = function(page) {
  if (!this._config) { throw new Error('config must be read first'); }
  if (!this._layoutsCache) { throw new Error('layouts cache must be created first'); }

  var vars = _.extend({}, this._config.vars, page.config.vars, { content: page.contents });
  var layoutName = page.config.layout || this._config.layout || 'default';
  var layout = this._layoutsCache[layoutName];
  return layout.replace(/{{\s*(\w*)\s*}}/g, function(match, name) {
    return vars[name];
  });
};
