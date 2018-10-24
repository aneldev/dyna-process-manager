(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("dyna-logger"), require("child_process"), require("dyna-guid"), require("events"), require("which"), require("os"));
	else if(typeof define === 'function' && define.amd)
		define("dyna-process-manager", ["dyna-logger", "child_process", "dyna-guid", "events", "which", "os"], factory);
	else if(typeof exports === 'object')
		exports["dyna-process-manager"] = factory(require("dyna-logger"), require("child_process"), require("dyna-guid"), require("events"), require("which"), require("os"));
	else
		root["dyna-process-manager"] = factory(root["dyna-logger"], root["child_process"], root["dyna-guid"], root["events"], root["which"], root["os"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_10__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
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
var cp = __webpack_require__(5);
var which = __webpack_require__(8);
var events_1 = __webpack_require__(7);
var dyna_guid_1 = __webpack_require__(6);
var dyna_logger_1 = __webpack_require__(1);
var EOL = __webpack_require__(10).EOL;
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
            var applyArgs = Array.isArray(args)
                ? args
                : args.split(' ').filter(function (a) { return !!a; });
            if (_this._active)
                resolve(false);
            try {
                _this._process = cp.spawn(command, applyArgs, {
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
        message = DynaProcess.cleanProcessConsole(message);
        this.logger.log("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
    };
    DynaProcess.prototype._consoleError = function (message, data, processSays) {
        if (data === void 0) { data = undefined; }
        if (processSays === void 0) { processSays = false; }
        message = DynaProcess.cleanProcessConsole(message);
        this.logger.error("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
    };
    DynaProcess.cleanProcessConsole = function (text) {
        text = text.toString();
        if (text.endsWith(EOL))
            text = text.slice(0, EOL.length);
        return text;
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
var DynaProcessManager_1 = __webpack_require__(3);
exports.DynaProcessManager = DynaProcessManager_1.DynaProcessManager;
var DynaProcess_1 = __webpack_require__(0);
exports.DynaProcess = DynaProcess_1.DynaProcess;
exports.EDynaProcessEvent = DynaProcess_1.EDynaProcessEvent;
var codeDataString_1 = __webpack_require__(4);
exports.encodeDataToString = codeDataString_1.encodeDataToString;
exports.decodeStringToData = codeDataString_1.decodeStringToData;


/***/ }),
/* 3 */
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDataToString = function (data) { return encodeURI(JSON.stringify(data)); };
exports.decodeStringToData = function (encoded) { return JSON.parse(decodeURI(encoded)); };


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("dyna-guid");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("which");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ })
/******/ ]);
});