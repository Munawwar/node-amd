## node-amd

Aim of this project is to make AMD modules usable in nodejs. Useful for reusing client-side data model code on the server-side.

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

### Not supported yet

- http/https URLs in dependencies.
- [CommonJS Wrapper style](http://requirejs.org/docs/api.html#cjsmodule).
- Plugin API

