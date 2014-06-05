# Blowtorch

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][david-image]][david-url]

> This repository is for learning purposes. It may intentionally contain bugs or
fail to function properly. The code may be purposefully difficult to read,
contain syntax errors, or only be a partial solution. You should not base code
off of this and absolutely should not use it in production.

```
blowtorch src dest
```

The expected setup of the `src` dir is to have the following:

 - A `_pages` directory
 - A `_layouts` directory

These directories are special and will be processed separately. All other files
will be recursively copied to the destination directory.

Each file within `_layouts` is a named layout. It will be used as a template for
each page. A layout should have a `{{ content }}` marker in it that will be
replaced with the content of each page.

Each of the pages will be copied to the destination directory. The content will
be embedded in the layout it specifies. Pages can specify both a layout and
variables to use in a template via a configuration file. The configuration file
should be the same name as the file, but with an underscore before it and a
`.json` extension. For instance, `blog.html` would have a configuration file of
`_blog.json`.

The `_site.json` file stored within the root of `src` will be used for the
default configuration for each page.

[travis-url]: http://travis-ci.org/wbyoung/jsi-blowtorch
[travis-image]: https://secure.travis-ci.org/wbyoung/jsi-blowtorch.png?branch=master
[npm-url]: https://npmjs.org/package/blowtorch
[npm-image]: https://badge.fury.io/js/blowtorch.png
[codeclimate-image]: https://codeclimate.com/github/wbyoung/jsi-blowtorch.png
[codeclimate-url]: https://codeclimate.com/github/wbyoung/jsi-blowtorch
[coverage-image]: https://coveralls.io/repos/wbyoung/jsi-blowtorch/badge.png
[coverage-url]: https://coveralls.io/r/wbyoung/jsi-blowtorch
[david-image]: https://david-dm.org/wbyoung/jsi-blowtorch.png?theme=shields.io
[david-url]: https://david-dm.org/wbyoung/jsi-blowtorch
