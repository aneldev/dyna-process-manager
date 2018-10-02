/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
var cp = __webpack_require__(8);
var which = __webpack_require__(15);
var events_1 = __webpack_require__(11);
var dyna_guid_1 = __webpack_require__(9);
var dyna_logger_1 = __webpack_require__(1);
var EDynaProcessEvent;
(function (EDynaProcessEvent) {
    EDynaProcessEvent["STOP"] = "STOP";
    EDynaProcessEvent["CRASH"] = "CRASH";
    EDynaProcessEvent["CONSOLE_ERROR"] = "CONSOLE_ERROR";
})(EDynaProcessEvent = exports.EDynaProcessEvent || (exports.EDynaProcessEvent = {}));
var DynaProcess = /** @class */ (function (_super) {
    __extends(DynaProcess, _super);
    function DynaProcess(_config) {
        var _this = _super.call(this) || this;
        _this._config = _config;
        _this._id = dyna_guid_1.guid(1);
        _this._active = false;
        _this._process = null;
        _this._startedAt = null;
        _this._stoppedAt = null;
        _this._stopCalled = false;
        _this._lastExitCode = null;
        _this._config = __assign({ env: {} }, (_this._config), { loggerSettings: __assign({ bufferLimit: 2000 }, _this._config.loggerSettings) });
        _this.logger = new dyna_logger_1.DynaLogger(_this._config.loggerSettings);
        if (_this._config.command === "node")
            _this._config.command = which.sync('node', { nothrow: true });
        return _this;
    }
    Object.defineProperty(DynaProcess.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynaProcess.prototype, "active", {
        get: function () {
            return this._active;
        },
        enumerable: true,
        configurable: true
    });
    // returns true if started and false if it was already started; rejects on errors
    DynaProcess.prototype.start = function () {
        this._stopCalled = false;
        return this._start();
    };
    DynaProcess.prototype._start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this._config, command = _a.command, args = _a.args, cwd = _a.cwd, env = _a.env;
            if (_this._active)
                resolve(false);
            try {
                _this._process = cp.spawn(command, args, {
                    cwd: cwd,
                    env: env
                });
                _this._active = true;
                _this._process.stdout.on('data', function (text) { return _this._handleOnConsoleLog(text); });
                _this._process.stderr.on('data', function (text) { return _this._handleOnConsoleError(text); });
                _this._process.on('close', function (code, signal) { return _this._handleOnClose(code, signal); });
                _this._process.on('error', function (error) { return _this._handleProcessError(error); });
                _this._startedAt = new Date();
                _this._stoppedAt = null;
                _this._lastExitCode = null;
                resolve(true);
            }
            catch (error) {
                _this._active = false;
                reject({
                    section: 'DynaProcess/start',
                    message: 'Process cannot start',
                    error: error,
                    data: { processSetup: _this._config },
                });
            }
        });
    };
    DynaProcess.prototype.stop = function (signal) {
        // help: https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal
        this._stopCalled = true;
        this._process.kill(signal);
    };
    DynaProcess.prototype._handleOnConsoleLog = function (text) {
        this._consoleLog(text, null, true);
    };
    DynaProcess.prototype._handleOnConsoleError = function (text) {
        this._consoleError(text, null, true);
        this.emit(EDynaProcessEvent.CONSOLE_ERROR);
    };
    DynaProcess.prototype._handleOnClose = function (exitCode, signal) {
        var _this = this;
        // help: https://nodejs.org/api/child_process.html#child_process_event_close
        var guard = this._config.guard;
        this._active = false;
        this._stoppedAt = new Date;
        this._lastExitCode = exitCode;
        if (exitCode) {
            this._consoleError("Crashed! Exited with exit code [" + exitCode + "] and signal [" + signal + "]");
            this.emit(EDynaProcessEvent.CRASH, { exitCode: exitCode });
            if (guard) {
                if (!this._stopCalled) {
                    setTimeout(function () {
                        _this._start();
                    }, guard.restartAfterMs || 0);
                }
                else {
                    this.emit(EDynaProcessEvent.STOP);
                }
            }
        }
        else {
            this._consoleLog("Stopped. Exited with exit code [" + exitCode + "] and signal [" + signal + "]");
            this.emit(EDynaProcessEvent.STOP);
        }
    };
    DynaProcess.prototype._handleProcessError = function (error) {
        this._consoleError('general error', { error: error, pid: this._process.pid });
    };
    DynaProcess.prototype._consoleLog = function (message, data, processSays) {
        if (data === void 0) { data = undefined; }
        if (processSays === void 0) { processSays = false; }
        this.logger.log("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
    };
    DynaProcess.prototype._consoleError = function (message, data, processSays) {
        if (data === void 0) { data = undefined; }
        if (processSays === void 0) { processSays = false; }
        this.logger.error("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
    };
    return DynaProcess;
}(events_1.EventEmitter));
exports.DynaProcess = DynaProcess;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("dyna-logger");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(7);
__webpack_require__(13);


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dyna_logger_1 = __webpack_require__(1);
var DynaProcess_1 = __webpack_require__(0);
var DynaProcessManager = /** @class */ (function () {
    function DynaProcessManager(_config) {
        if (_config === void 0) { _config = {}; }
        this._config = _config;
        this._processes = {};
        this._config = __assign({}, this._config, { loggerSettings: __assign({ bufferLimit: 2000 }, (this._config.loggerSettings || {})) });
        this._logger = new dyna_logger_1.DynaLogger(this._config.loggerSettings);
    }
    DynaProcessManager.prototype.addProcess = function (processSetup) {
        if (!processSetup.loggerSettings)
            processSetup.loggerSettings = this._config.loggerSettings;
        var newProcess = new DynaProcess_1.DynaProcess(processSetup);
        this._processes[newProcess.id] = newProcess;
        return newProcess;
    };
    DynaProcessManager.prototype.removeProcess = function (processId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var process = _this.getProcess(processId);
            if (!process) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: '3598644',
                    message: 'Process not found with this id',
                    data: { processId: processId },
                });
                return;
            }
            if (process.active) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: '3598645',
                    message: 'Process is working',
                    data: { processId: processId },
                });
                return;
            }
            delete _this._processes[processId];
            resolve();
        });
    };
    DynaProcessManager.prototype.getProcess = function (processId) {
        return this._processes[processId];
    };
    Object.defineProperty(DynaProcessManager.prototype, "count", {
        get: function () {
            return Object.keys(this._processes).length;
        },
        enumerable: true,
        configurable: true
    });
    DynaProcessManager.prototype.stop = function (processId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var process = _this.getProcess(processId);
            if (!process) {
                reject({
                    section: 'ProcessManager/stop',
                    code: '3598643',
                    message: 'Process not found with this id',
                    data: { processId: processId },
                });
                return;
            }
            var resolve_ = function () {
                resolve();
            };
            process.on(DynaProcess_1.EDynaProcessEvent.STOP, resolve_);
            process.on(DynaProcess_1.EDynaProcessEvent.CRASH, resolve_);
            process.stop();
        });
    };
    DynaProcessManager.prototype.stopAll = function () {
        var _this = this;
        return Promise.all(Object.keys(this._processes)
            .map(function (processId) { return _this.stop(processId); })).then(function () { return undefined; });
    };
    return DynaProcessManager;
}());
exports.DynaProcessManager = DynaProcessManager;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DynaProcessManager_1 = __webpack_require__(4);
exports.DynaProcessManager = DynaProcessManager_1.DynaProcessManager;
var DynaProcess_1 = __webpack_require__(0);
exports.DynaProcess = DynaProcess_1.DynaProcess;
exports.EDynaProcessEvent = DynaProcess_1.EDynaProcessEvent;
var codeDataString_1 = __webpack_require__(18);
exports.encodeDataToString = codeDataString_1.encodeDataToString;
exports.decodeStringToData = codeDataString_1.decodeStringToData;


/***/ }),
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Dev node: Come on!!! this is super ugly...
// If you find a stable way to debug the jest tests please fork me!
// As documented here: https://facebook.github.io/jest/docs/troubleshooting.html is not working as far of May/17
if (typeof global === 'undefined' && typeof window !== 'undefined') global = window;

var HIDE_SUCCESS_VALIDATION = true;

// init section

global._mockJest = null;

global.clearTest = function () {
	global._mockJest = {
		errors: 0,
		passed: 0,
		descriptions: []
	};
};
global.clearTest();

global.describe = function (description, cbDefineIts) {
	global._mockJest.descriptions.push({
		description: description,
		its: []
	});

	cbDefineIts();
	startTests();
};

global.describe.skip = function () {
	return undefined;
};

global.it = function (description, cbTest) {
	global._mockJest.descriptions[global._mockJest.descriptions.length - 1].its.push({
		description: description,
		cbTest: cbTest
	});
	startTests();
};

global.it.skip = function () {
	return undefined;
};

global.expect = function (expectValue) {
	return comparisons(expectValue);
};

// start and functions section

var comparisons = function comparisons(expectValue) {
	var not = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	return {
		get not() {
			return comparisons(expectValue, true);
		},
		toBe: function toBe(toBeValue) {
			var result = expectValue === toBeValue;
			if (not) result = !result;
			if (result) {
				if (!HIDE_SUCCESS_VALIDATION) console.log('        Success, equal value [' + expectValue + ' === ' + toBeValue + ']');
				global._mockJest.passed++;
			} else {
				console.log('        FAILED, ' + (not ? "not " : "") + 'expected [' + toBeValue + '] but received [' + expectValue + ']');
				global._mockJest.errors++;
			}
		}
	};
};

var startTimer = null;

function startTests() {
	if (startTimer) clearTimeout(startTimer);
	startTimer = setTimeout(executeTests, 100);
}

function executeTests() {
	var descriptions = [].concat(global._mockJest.descriptions);

	var processTheNextDescription = function processTheNextDescription() {
		var description = descriptions.shift();
		if (description) {
			executeADescription(description, function () {
				processTheNextDescription();
			});
		} else {
			finished();
		}
	};

	// start
	processTheNextDescription();
}

function executeADescription(description, cbCompleted) {
	console.log('Description::: Start:', description.description);
	var its = [].concat(description.its);

	executeIts(its, function () {
		console.log('Description::: Finished:', description.description);
		console.log('');
		cbCompleted();
	});
}

function executeIts(its, cbCompleted) {
	var it = its.shift();
	if (!it) {
		cbCompleted();
		return;
	}

	console.log('    it:::', it.description);
	if (it.cbTest.length === 0) {
		it.cbTest();
		executeIts(its, cbCompleted);
	} else {
		it.cbTest(function () {
			executeIts(its, cbCompleted);
		});
	}
}

function exit(code) {
	if (typeof process !== 'undefined' && typeof process.exit !== 'undefined') {
		process.exit(code);
	}
}

function finished() {
	var report = 'All TEST finished, results:' + ' ' + 'errors:' + ' ' + global._mockJest.errors + ' ' + 'passed:' + ' ' + global._mockJest.passed;
	console.log('');
	if (global._mockJest.errors) {
		console.log(' xx   xx ');
		console.log('  xx xx  ');
		console.log('   xxx   ');
		console.log('  xx xx  ');
		console.log(' xx   xx ' + report);
		exit(100);
	} else {
		console.log('      vv');
		console.log('     vv');
		console.log('vv  vv');
		console.log(' vvvv');
		console.log('  vv      ' + report);
		exit(0);
	}
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("dyna-guid");

/***/ }),
/* 10 */,
/* 11 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
module.exports = __webpack_require__(2);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
if (typeof jasmine !== 'undefined')
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
var src_1 = __webpack_require__(5);
var pm = new src_1.DynaProcessManager({
    loggerSettings: {
        consoleLogs: false,
        consoleErrorLogs: false,
    },
});
describe('Dyna process manager - should restart the failed process and stop it on demand', function () {
    var myProcess;
    var crashTimeout = 1000;
    var stopped = false;
    var crashed = false;
    it('should create the process', function () {
        myProcess = pm.addProcess({
            name: 'process test',
            command: 'node',
            args: ("ProcessSampleThrow.js ProcessTestForCrash " + crashTimeout).split(' '),
            cwd: './tests/scripts',
            guard: {
                restartAfterMs: 50,
            },
        });
        myProcess.on(src_1.EDynaProcessEvent.STOP, function () { return stopped = true; });
        myProcess.on(src_1.EDynaProcessEvent.CRASH, function () { return crashed = true; });
        expect(myProcess).not.toBe(undefined);
    });
    it('should start myProcess', function (done) {
        myProcess.start()
            .then(function () {
            expect(myProcess.active).toBe(true);
            done();
        })
            .catch(function (error) {
            console.error(error);
            done();
        });
    });
    it('myProcess should still work', function (done) {
        setTimeout(function () {
            expect(myProcess.active).toBe(true);
            done();
        }, crashTimeout * 0.5);
    });
    it('myProcess should still work because is restarted by the guard', function (done) {
        setTimeout(function () {
            expect(myProcess.active).toBe(true);
            expect(stopped).toBe(false);
            expect(crashed).toBe(true);
            done();
        }, crashTimeout * 1);
    });
    it('should stop the process', function (done) {
        pm.stop(myProcess.id)
            .then(function () {
            done();
        })
            .catch(function (error) {
            console.error(error);
            done();
        });
    });
    it('should have processes', function () {
        expect(pm.count).toBe(1);
    });
    it('should remove the processes', function () {
        pm.removeProcess(myProcess.id);
        expect(pm.count).toBe(0);
    });
});


/***/ }),
/* 14 */,
/* 15 */
/***/ (function(module, exports) {

module.exports = require("which");

/***/ }),
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDataToString = function (data) { return encodeURI(JSON.stringify(data)); };
exports.decodeStringToData = function (encoded) { return JSON.parse(decodeURI(encoded)); };


/***/ })
/******/ ]);