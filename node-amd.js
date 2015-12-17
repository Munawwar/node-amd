/**
 * MIT License
 */

/*global GLOBAL, console*/

var path = require('path');

var modules = {};

function getDependencies(deps, callerScript) {
    var cfg = GLOBAL.requirejs.cfg,
        callerPath = callerScript.split('/').slice(0, -1).join('/'); //Remove script name.

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
        } else if (depPath[0] === '/' || depPath.slice(-3) === '.js') { //Absolute path
            fullPath = depPath;
        } else { //Path relative to baseUrl
            fullPath = path.resolve(cfg.baseUrl, depPath);
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

    return deps;
}

GLOBAL.requirejs = function (deps, callback) {
    if (arguments.length === 1) {
        callback = deps;
        deps = [];
    }

    //Figure out the path of the JS file that called this function.
    var callerScript = (new Error()).stack.split('\n')[2];
    callerScript = callerScript.substr(callerScript.indexOf('(') + 1).split(':')[0];

    //Find dependencies
    deps = getDependencies(deps, callerScript);

    callback.apply(null, deps);
};

GLOBAL.requirejs.config = function (cfg) {
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
};

GLOBAL.define = function (name, deps, moduleFactory) {
    var args = Array.prototype.slice.call(arguments);

    moduleFactory = args.pop();
    deps = args.pop() || [];
    name = args.pop();

    //Figure out the path of the JS file that called this function.
    var callerScript = (new Error()).stack.split('\n')[2];
    callerScript = callerScript.substr(callerScript.indexOf('(') + 1).split(':')[0];
    //console.log('define() called from ' + callerScript);

    //Find dependencies
    deps = getDependencies(deps, callerScript);

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
