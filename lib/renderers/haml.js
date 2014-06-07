'use strict';

var Renderer = require('./index');
var haml = require('haml');

function HAMLRenderer() {
  Renderer.apply(this, arguments);
}

HAMLRenderer.prototype = Object.create(Renderer.prototype);
HAMLRenderer.prototype.constructor = HAMLRenderer;

HAMLRenderer.prototype.render = function() {
  return haml.render(this._content, { locals: this._context });
};

module.exports = HAMLRenderer;
