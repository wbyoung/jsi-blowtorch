'use strict';

var fs = require('fs');
var path = require('path');


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
module.exports.readdirRecursive = function(dir, cb) {
  var remaining = ['.'];
  var result = [];

  var next = function() {
    var relativeDirPath = remaining.shift();
    var dirPath = path.join(dir, relativeDirPath);
    fs.readdir(dirPath, function(err, files) {
      if (err) { return cb(err); }

      var err;
      var iterated = 0;
      var finishedIterating = function() {
        if (err) { return cb(err); }
        if (remaining.length === 0) {
          cb(null, result.sort());
        }
        else { next(); }
      };

      files.forEach(function(file) {
        if (file[0] === '.') { return; }
        var filePath = path.join(dirPath, file);
        var relativeFilePath = path.join(relativeDirPath, file);
        fs.stat(filePath, function(_err, stats) {
          if (_err) { err = _err; }
          else if (!err) {
            if (stats.isDirectory()) { remaining.push(relativeFilePath); }
            else { result.push(relativeFilePath); }
          }
          iterated += 1;
          if (iterated === files.length) {
            finishedIterating();
          }
        });
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
module.exports.filesEqual = function(fileA, fileB, cb) {
  var options = { encoding: 'utf8' };
  fs.readFile(fileA, options, function(err, contentsA) {
    if (err) { return cb(err); }
    fs.readFile(fileB, options, function(err, contentsB) {
      if (err) { return cb(err); }
      cb(null, contentsA === contentsB);
    });
  })
};
