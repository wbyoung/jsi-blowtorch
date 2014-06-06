'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('./async');


/**
 * Read a directory recursively.
 * The directory will be read depth-first and will return paths relative
 * to the base directory. It will only result in file names, not directories.
 *
 * @function
 * @param  {string}   dir The directory to read
 * @param  {function} cb  The callback to call when complete. Receives error
 * and array of relative file paths.
 */
var readdirRecursive = module.exports.readdirRecursive = function(dir, cb) {
  var remaining = ['.'];
  var result = [];

  var next = function() {
    var relativeDirPath = remaining.shift();
    var dirPath = path.join(dir, relativeDirPath);
    fs.readdir(dirPath, function(err, files) {
      if (err) { return cb(err); }
      async.each(files, function(file, done) {
        if (file[0] === '.') { return done(); }
        var filePath = path.join(dirPath, file);
        var relativeFilePath = path.join(relativeDirPath, file);
        fs.stat(filePath, function(err, stats) {
          if (err) { return done(err); }
          if (stats.isDirectory()) { remaining.push(relativeFilePath); }
          else { result.push(relativeFilePath); }
          done();
        });
      }, function(err) {
        if (err) { return cb(err); }
        if (remaining.length === 0) {
          cb(null, result.sort());
        }
        else { next(); }
      });
    });
  };
  next();
};

/**
 * Test if files are equal.
 *
 * @param  {string} fileA  Path to first file
 * @param  {string} fileB  Path to second file
 * @param  {function} cb   Callback to call when finished check. Receives error
 * and boolean.
 */
var filesEqual = module.exports.filesEqual = function(fileA, fileB, cb) {
  var options = { encoding: 'utf8' };
  fs.readFile(fileA, options, function(err, contentsA) {
    if (err) { return cb(err); }
    fs.readFile(fileB, options, function(err, contentsB) {
      if (err) { return cb(err); }
      cb(null, contentsA === contentsB);
    });
  })
};


/**
 * Recursively test if directories are equal.
 *
 * @param  {string} dirA  Path to first dir
 * @param  {string} dirB  Path to second dir
 * @param  {function} cb   Callback to call when finished check. Receives error
 * and boolean.
 */
module.exports.directoriesEqual = function(directoryA, directoryB, cb) {
  readdirRecursive(directoryA, function(err, directoryAContents) {
    if (err) { return cb(err); }
    readdirRecursive(directoryB, function(err, directoryBContents) {
      if (err) { return cb(err); }

      if (directoryAContents.length !== directoryBContents.length) {
        cb(null, false);
      }
      else {
        directoryAContents = directoryAContents.sort();
        directoryBContents = directoryBContents.sort();
        if (!_.isEqual(directoryAContents, directoryBContents)) {
          cb(null, false);
        }
        else {
          var result = true;
          async.each(directoryAContents, function(relativePath, done) {
            var aFilePath = path.join(directoryA, relativePath);
            var bFilePath = path.join(directoryB, relativePath);
            filesEqual(aFilePath, bFilePath, function(err, singleResult) {
              if (err) { return done(err); }
              result = singleResult && result;
              done();
            });
          }, function(err) {
            if (err) { return cb(err); }
            cb(null, result);

          });
        }
      }
    });
  });
};
