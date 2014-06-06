'use strict';

var _ = require('lodash');
var fs = require('fs');
var async = require('./async');
var fsExtras = require('./fs-extras');

var Project = module.exports = function(root) {
  this._root = root;
  this._layouts = {};
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
Project.prototype._readConfig = function() {

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
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._generate = function(cb) {
  this._createFileList(function(err) {
    if (err) { return cb(err); }

    this._findLayouts();
    this._findPages();
    this._findMiscFiles();

    this._readLayouts(function(err) {
      if (err) { return cb(err); }
      this._eachPageAsync(function(page, done) {
        this._createPage(page, dst, done);
      }, function(err) {
        if (err) { return cb(err); }
        this._copyMiscFiles(cb);
      });
    });
  });
};


/**
 * Read layouts and caches them in `_this.layouts` by name.
 *
 * @function
 * @param {function} cb The callback to call when completed. This will receive
 * an error only.
 */
Project.prototype._readLayouts = function(cb) {
};


/**
 * Iterates through each page. Each page object will be represented as an
 * object with properties `path`, the relative path, `contents`, and `config`.
 *
 * @function
 * @param  {function} iterator  Works like `async.each` iterator
 * @param  {function} cb        Works like `async.each` cb
 */
Project.prototype._eachPageAsync = function(iterator, cb) {

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
  var dirname = path.dirname(page.path);

  var srcPath = path.join(this._root, page.path);
  var dstDirname = path.join(dir, dirname);
  var dstPath = path.join(dir, page.path);
  var result = this._applyLayout(page);

  fsExtras.mkdirp(dstDirname, function(err) {
    if (err) { return cb(err); }
    fs.writeFile(dstPath, { encoding: 'utf8' }, result, cb);
  });
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
};

/**
 * Uses the known layouts to create a new page based on the page's
 * configuration.
 */
Project.prototype._applyLayout = function(page) {
  var vars = _.extend({}, this._config.vars, page.config.vars);
  var layoutName = page.config.layout || this._config.layout;
  var layout = this._layouts[layoutName];
  return layout.replace(/{{\s*(\w*)\s*}}/g, function(match, name) {
    return vars[name];
  });
};
