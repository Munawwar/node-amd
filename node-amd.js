/**
 * MIT License
 */

/**
 * @param {String} baseUrl A root-relative path.
 * @param {String} relative A path relative to baseUrl.
 * @returns {String} Converts 'relative' to absolute url
 * @private
 */
function getAbsolute(baseUrl, relative) {
    if (baseUrl && baseUrl.slice(-1) !== '/') {
        baseUrl += '/';
    }
    var matches = relative.match(/\.\.\//g), len; //match ../s
    if (matches) {
        len = matches.length;
        baseUrl = baseUrl.split('/');
        baseUrl.pop(); //last one is "" due to trailing /
        if (len > baseUrl.length) {
            throw new Error('Cannot resolve parent. Maybe you added too many ../s');
        }
        baseUrl = baseUrl.slice(0, -len).join('/') + '/';
    }
    //remove ../s and ./
    return baseUrl + relative.replace(/\.\.\//g, '').replace(/^\.\//, '');
}

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

            cfg.baseUrl = getAbsolute(callerPath, cfg.baseUrl);
            console.log('baseUrl = ' + cfg.baseUrl);

            Object.keys(cfg.paths || {}).forEach(function (moduleName) {
                var path = getAbsolute(cfg.baseUrl, cfg.paths[moduleName]);
                console.log('Resolved path for ' + moduleName + ' to ' + path);
                cfg.paths[moduleName] = path;
            });
        }
    }
};

GLOBAL.define = (function () {
    var modules = {};

    return function (name, deps, moduleFactory) {
        var args = Array.prototype.slice.call(arguments),
            moduleFactory = args.pop(),
            deps = args.pop() || [],
            name = args.pop(),
            cfg = requirejs.config();

        //Figure out the path of the JS file that called this function.
        var callerScript = (new Error()).stack.split('\n')[2];
        callerScript = callerScript.substr(callerScript.indexOf('(') + 1).split(':')[0];
        var callerPath = callerScript.split('/').slice(0, -1).join('/'); //Remove script name.
        console.log('define() called from ' + callerScript);

        //Normalize path
        deps.forEach(function (depPath, i) {
            //Detect plugins
            if (depPath.match(/^\w+!/)) {
                return console.warn(callerScript + ': RequireJS plugins aren\'t supported.');
            }

            var fullPath;
            if (depPath.search(/^(http:\/\/|https:\/\/|\/\/)/) > -1) {
                fullPath = depPath;
            } else if (depPath[0] === '.') { //Path relative to caller script.
                fullPath = getAbsolute(callerPath, depPath);
            } else if (cfg.paths[depPath]) { //If module name is in config, load that instead
                fullPath = cfg.paths[depPath];
            } else { //Path relative to baseUrl
                fullPath = getAbsolute(requirejs.cfg.baseUrl, depPath);
            }
            console.log(' -- Dependency ' + fullPath);
            if (!modules[fullPath]) {
                require(fullPath);
            }
            deps[i] = modules[fullPath];
        });

        console.log('Executing ' + callerScript);
        modules[name] = modules[callerScript.replace(/\.js$/, '')] = moduleFactory.apply(null, deps);
    };
}());

GLOBAL.define.amd = true; //I lie...for the sake of compatibility.
