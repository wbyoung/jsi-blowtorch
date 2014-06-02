var fs = require('fs');

exports.processFile = function(file, cb) {
  fs.readFile(file, { encoding: 'utf8' }, function(err, contents) {
    cb(err, contents.trim().split(' ').reverse().join(' '));
  });
};
