'use strict';

/**
 * Asynchronous for each
 *
 * @function
 * @param  {array} array        The Array to iterate
 * @param  {function} iterator  A callback for each item. This receives two
 * arguments, `item` the item in the array, and `done`, a function to call when
 * you're finished with this particular async operation.
 * @param  {function} cb        A callback to call after iteration has
 * completed.
 */
module.exports.each = function(array, iterator, cb) {
  var completed = 0;
  var done = function(err) {
    cb(err);
    done = function() {};
  };

  array.forEach(function(item) {
    iterator(item, function(err) {
      completed += 1;
      if (err) { done(err); }
      else if (completed === array.length) { done(); }
    });
  });
};
