'use strict';

function Renderer(content, context) {
  this._content = content;
  this._context = context;
}

/**
 */
Renderer.prototype.render = function() {
  throw new Error('use concrete subclass of Renderer');
};

module.exports = Renderer;
