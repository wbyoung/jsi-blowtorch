'use strict';

var fsExtras = require('./fs-extras');
var async = require('./async');
var template = require('./template');

/**
 * Generate a site
 *
 * @function
 * @param  {string}   src  The source directory
 * @param  {string}   dest The destination direcotry
 * @param  {function} cb   The callback to call when the generation is
 * complete. This just takes an error.
 */
module.exports = function(src, dest, cb) {
  // TODO: this function doesn't work yet.
  fsExtras.readdirRecursive(src, function(err, files) {
    async.each(files, function(relativePath, done) {
      var dirname = path.dirname(relativePath);
      var destDirname = path.join(dest, dirname);
      var destPath = path.join(dest, relativePath);
      var srcPath = path.join(src, relativePath);
      fsExtras.mkdirP(destDirname, function(err) {
        if (err) { return done(err); }
        template.create(srcPath, function(err) {
          if (err) { return done(err); }
          done();
        });
      });
    }, cb);
  });
};
