/**
 * MIT License
 */

/*global GLOBAL,console*/

var path = require('path');

GLOBAL.requirejs = {
    config: function (cfg) {
        if (!cfg) {
            return this.cfg;
        } else {
            this.cfg = cfg;

            //Figure out the path of the JS file that called this function.
            var callerScript = (new Error()).stack.split('\n')[2];
            callerScript = callerScript.substr(callerScript.indexOf('(') + 1).split(':')[0];
            var callerPath = callerScript.split('/').slice(0, -1).join('/'); //Remove script name.

            cfg.baseUrl = path.resolve(callerPath, cfg.baseUrl);
            //console.log('baseUrl = ' + cfg.baseUrl);

            Object.keys(cfg.paths || {}).forEach(function (moduleName) {
                var fullPath = path.resolve(cfg.baseUrl, cfg.paths[moduleName]);
                //console.log('Resolved path for ' + moduleName + ' to ' + path);
                cfg.paths[moduleName] = fullPath;
            });
        }
    }
};

GLOBAL.define = (function () {
    var modules = {};

    return function (name, deps, moduleFactory) {
        var args = Array.prototype.slice.call(arguments),
            cfg = requirejs.config();
        moduleFactory = args.pop();
        deps = args.pop() || [];
        name = args.pop();

        //Figure out the path of the JS file that called this function.
        var callerScript = (new Error()).stack.split('\n')[2];
        callerScript = callerScript.substr(callerScript.indexOf('(') + 1).split(':')[0];
        var callerPath = callerScript.split('/').slice(0, -1).join('/'); //Remove script name.
        //console.log('define() called from ' + callerScript);

        //Find dependencies
        deps.forEach(function (depPath, i) {
            //Detect plugins
            if (depPath.match(/^\w+!/)) {
                return console.warn(callerScript + ': RequireJS plugins aren\'t supported.');
            }

            var fullPath;
            if (depPath.search(/^(http:\/\/|https:\/\/|\/\/)/) > -1) {
                console.warn(callerScript + ': http,https URLs aren\'t supported.');
                fullPath = depPath;
                modules[fullPath] = {};
            } else if (depPath[0] === '.') { //Path relative to caller script.
                fullPath = path.resolve(callerPath, depPath);
            } else if (cfg.paths[depPath]) { //If module name is in config, load that instead
                fullPath = cfg.paths[depPath];
            } else { //Path relative to baseUrl
                fullPath = path.resolve(requirejs.cfg.baseUrl, depPath);
            }
            //console.log(' -- Dependency ' + fullPath);
            if (!modules[fullPath]) {
                var ret = require(fullPath);
                //Support for UMD. if ret exists, then the script took the commonjs require() route.
                if (typeof ret === 'function' || Object.keys(ret).length) {
                    modules[fullPath] = ret;
                }
            }
            deps[i] = modules[fullPath];
        });

        //console.log('Executing ' + callerScript);
        var ret = moduleFactory; // Support define(<object>)
        if (typeof moduleFactory === 'function') {
            ret = moduleFactory.apply(null, deps);
        }
        if (name) {
            modules[name] = ret;
        }
        modules[callerScript.replace(/\.js$/, '')] = ret;
    };
}());
