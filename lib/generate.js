'use strict';

var Project = require('./project');

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
  var project = new Project(src);
  project.generate(dest, cb);
};
