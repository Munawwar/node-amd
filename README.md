## node-amd

Aim of this project is to make AMD modules usable in nodejs. Useful for reusing client-side data model code on the server-side.

### Usage
```
require('./node-amd.js');

requirejs.config({
    baseUrl: '../../http-dev/',
    paths: {
        jquery: 'lib/jquery/dist/jquery'
    }
});

define(['web/model/BaseModel', 'jquery'], function (BaseModel, $) {
    //...
});
```

