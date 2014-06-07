'use strict';

var Renderer = require('./index');

function HTMLRenderer() {
  Renderer.apply(this, arguments);
}

HTMLRenderer.prototype = Object.create(Renderer.prototype);
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.render = function() {
  return this._content.replace(/{{\s*(\w*)\s*}}/g, function(match, name) {
    return this._context[name];
  }.bind(this));
};

module.exports = HTMLRenderer;
