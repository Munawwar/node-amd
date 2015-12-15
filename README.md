## node-amd

Aim of this project is to make AMD modules usable in nodejs. Useful for sharing client-side data models with server-side.

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

