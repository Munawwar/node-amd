## node-amd

Aim of this project is to make AMD modules usable with nodejs. Useful for unit testing or reusing client-side data model code on the server-side.

**Why do you not use amdefine?**

amdefine forces one to add this -> `if (typeof define !== 'function') { var define = require('amdefine')(module) }` to **each** module, which is inconvenient. node-amd declares globals.

### Usage
```js
require('./node-amd.js');

requirejs.config({
    baseUrl: '../../www/', //path relative to current script (__dirname).
    paths: {
        jquery: 'lib/jquery/dist/jquery'
    }
});

define(['web/model/BaseModel', 'jquery'], function (BaseModel, $) {
    //...
});
```

### Configuration support

At the moment only baseUrl and paths configuration options are supported.

### Plugin support

node-amd has partial support for plugins. Only [plugin.load()](http://requirejs.org/docs/plugins.html#apiload) function is supported, and
plugin should be added to paths config.

Existing plugins won't work without modification, since most plugins use XHR. On node, node-amd expect requirejs plugin to synchronously load and return output. Example:

```js
var fs = require('fs');
define({
    load: function (path, req, onload) {
        //asynchronous API like fs.readFile() cannot be used.
        onload(fs.readFileSync(req.toUrl(path), 'utf8'));
    }
});
```

### Not supported

- Full requirejs configuration options.
- http/https URLs in dependencies.
- [CommonJS Wrapper style](http://requirejs.org/docs/api.html#cjsmodule).
- Full plugin API

