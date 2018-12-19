(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("dyna-process-manager", [], factory);
	else if(typeof exports === 'object')
		exports["dyna-process-manager"] = factory();
	else
		root["dyna-process-manager"] = factory();
})(global, function() {
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/DynaProcess.ts":
/*!****************************!*\
  !*** ./src/DynaProcess.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };

    return extendStatics(d, b);
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
}); // help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

var cp = __webpack_require__(/*! child_process */ "child_process");

var which = __webpack_require__(/*! which */ "which");

var events_1 = __webpack_require__(/*! events */ "events");

var dyna_guid_1 = __webpack_require__(/*! dyna-guid */ "dyna-guid");

var node_1 = __webpack_require__(/*! dyna-logger/node */ "dyna-logger/node");

var EOL = __webpack_require__(/*! os */ "os").EOL;

var EDynaProcessEvent;

(function (EDynaProcessEvent) {
  EDynaProcessEvent["STOP"] = "STOP";
  EDynaProcessEvent["CRASH"] = "CRASH";
  EDynaProcessEvent["CONSOLE_ERROR"] = "CONSOLE_ERROR";
})(EDynaProcessEvent = exports.EDynaProcessEvent || (exports.EDynaProcessEvent = {}));

var DynaProcess =
/** @class */
function (_super) {
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
    _this._config = __assign({
      env: {}
    }, _this._config, {
      loggerSettings: __assign({
        bufferLimit: 2000
      }, _this._config.loggerSettings)
    });
    _this.logger = new node_1.DynaLogger(_this._config.loggerSettings);
    if (_this._config.command === "node") _this._config.command = which.sync('node', {
      nothrow: true
    });
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
  }); // returns true if started and false if it was already started; rejects on errors

  DynaProcess.prototype.start = function () {
    this._stopCalled = false;
    return this._start();
  };

  DynaProcess.prototype._start = function () {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var _a = _this._config,
          command = _a.command,
          args = _a.args,
          cwd = _a.cwd,
          env = _a.env;
      var applyArgs = Array.isArray(args) ? args : args.split(' ').filter(function (a) {
        return !!a;
      });
      if (_this._active) resolve(false);

      try {
        _this._process = cp.spawn(command, applyArgs, {
          cwd: cwd,
          env: env
        });
        _this._active = true;

        _this._process.stdout.on('data', function (text) {
          return _this._handleOnConsoleLog(text);
        });

        _this._process.stderr.on('data', function (text) {
          return _this._handleOnConsoleError(text);
        });

        _this._process.on('close', function (code, signal) {
          return _this._handleOnClose(code, signal);
        });

        _this._process.on('error', function (error) {
          return _this._handleProcessError(error);
        });

        _this._startedAt = new Date();
        _this._stoppedAt = null;
        _this._lastExitCode = null;
        resolve(true);
      } catch (error) {
        _this._active = false;
        reject({
          section: 'DynaProcess/start',
          message: 'Process cannot start',
          error: error,
          data: {
            processSetup: _this._config
          }
        });
      }
    });
  };

  DynaProcess.prototype.stop = function (signal) {
    // help: https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal
    this._stopCalled = true;

    try {
      this._process.kill(signal);
    } catch (error) {
      this.emit(EDynaProcessEvent.CRASH, error);
    }
  };

  DynaProcess.prototype._handleOnConsoleLog = function (text) {
    this._consoleLog(text, null, true);
  };

  DynaProcess.prototype._handleOnConsoleError = function (text) {
    this._consoleError(text, null, true);

    this.emit(EDynaProcessEvent.CONSOLE_ERROR);
  };

  DynaProcess.prototype._handleOnClose = function (exitCode, signal) {
    var _this = this; // help: https://nodejs.org/api/child_process.html#child_process_event_close


    var guard = this._config.guard;
    this._active = false;
    this._stoppedAt = new Date();
    this._lastExitCode = exitCode;

    if (exitCode) {
      this._consoleError("Crashed! Exited with exit code [" + exitCode + "] and signal [" + signal + "]");

      this.emit(EDynaProcessEvent.CRASH, {
        exitCode: exitCode
      });

      if (guard) {
        if (!this._stopCalled) {
          setTimeout(function () {
            _this._start();
          }, guard.restartAfterMs || 0);
        } else {
          this.emit(EDynaProcessEvent.STOP);
        }
      }
    } else {
      this._consoleLog("Stopped. Exited with exit code [" + exitCode + "] and signal [" + signal + "]");

      this.emit(EDynaProcessEvent.STOP);
    }
  };

  DynaProcess.prototype._handleProcessError = function (error) {
    this._consoleError('general error', {
      error: error,
      pid: this._process.pid
    });
  };

  DynaProcess.prototype._consoleLog = function (message, data, processSays) {
    if (data === void 0) {
      data = undefined;
    }

    if (processSays === void 0) {
      processSays = false;
    }

    message = DynaProcess.cleanProcessConsole(message);
    this.logger.log("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
  };

  DynaProcess.prototype._consoleError = function (message, data, processSays) {
    if (data === void 0) {
      data = undefined;
    }

    if (processSays === void 0) {
      processSays = false;
    }

    message = DynaProcess.cleanProcessConsole(message);
    this.logger.error("Process: " + this._config.name + " " + this.id, "" + (processSays ? '> ' : '') + message, data);
  };

  DynaProcess.cleanProcessConsole = function (text) {
    text = text.toString();
    if (text.endsWith(EOL)) text = text.slice(0, -EOL.length);
    return text;
  };

  return DynaProcess;
}(events_1.EventEmitter);

exports.DynaProcess = DynaProcess;

/***/ }),

/***/ "./src/DynaProcessManager.ts":
/*!***********************************!*\
  !*** ./src/DynaProcessManager.ts ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var node_1 = __webpack_require__(/*! dyna-logger/node */ "dyna-logger/node");

exports.IDynaLoggerConfig = node_1.IDynaLoggerConfig;

var DynaProcess_1 = __webpack_require__(/*! ./DynaProcess */ "./src/DynaProcess.ts");

var DynaProcessManager =
/** @class */
function () {
  function DynaProcessManager(_config) {
    if (_config === void 0) {
      _config = {};
    }

    this._config = _config;
    this._processes = {};
    this._config = __assign({}, this._config, {
      loggerSettings: __assign({
        bufferLimit: 2000
      }, this._config.loggerSettings || {})
    });
    this._logger = new node_1.DynaLogger(this._config.loggerSettings);
  }

  DynaProcessManager.prototype.addProcess = function (processSetup) {
    if (!processSetup.loggerSettings) processSetup.loggerSettings = this._config.loggerSettings;
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
          data: {
            processId: processId
          }
        });
        return;
      }

      if (process.active) {
        reject({
          section: 'ProcessManager/removeProcess',
          code: '3598645',
          message: 'Process is working',
          data: {
            processId: processId
          }
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
          data: {
            processId: processId
          }
        });
        return; // exit
      }

      if (!process.active) {
        resolve();
        return; // exit
      }

      var handleStop = function () {
        process.off(DynaProcess_1.EDynaProcessEvent.STOP, handleStop);
        resolve();
      };

      var handleCrash = function () {
        process.off(DynaProcess_1.EDynaProcessEvent.CRASH, handleCrash);
        resolve();
      };

      process.on(DynaProcess_1.EDynaProcessEvent.STOP, handleStop);
      process.on(DynaProcess_1.EDynaProcessEvent.CRASH, handleCrash);
      setTimeout(function () {
        process.stop();
      }, 10);
    });
  };

  DynaProcessManager.prototype.stopAll = function () {
    var _this = this;

    return Promise.all(Object.keys(this._processes).map(function (processId) {
      return _this.stop(processId);
    })).then(function () {
      return undefined;
    });
  };

  return DynaProcessManager;
}();

exports.DynaProcessManager = DynaProcessManager;

/***/ }),

/***/ "./src/codeDataString.ts":
/*!*******************************!*\
  !*** ./src/codeDataString.ts ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.encodeDataToString = function (data) {
  return encodeURI(JSON.stringify(data));
};

exports.decodeStringToData = function (encoded) {
  return JSON.parse(decodeURI(encoded));
};

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var DynaProcessManager_1 = __webpack_require__(/*! ./DynaProcessManager */ "./src/DynaProcessManager.ts");

exports.DynaProcessManager = DynaProcessManager_1.DynaProcessManager;
exports.IDynaLoggerConfig = DynaProcessManager_1.IDynaLoggerConfig;

var DynaProcess_1 = __webpack_require__(/*! ./DynaProcess */ "./src/DynaProcess.ts");

exports.DynaProcess = DynaProcess_1.DynaProcess;
exports.EDynaProcessEvent = DynaProcess_1.EDynaProcessEvent;

var codeDataString_1 = __webpack_require__(/*! ./codeDataString */ "./src/codeDataString.ts");

exports.encodeDataToString = codeDataString_1.encodeDataToString;
exports.decodeStringToData = codeDataString_1.decodeStringToData;

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ "dyna-guid":
/*!****************************!*\
  !*** external "dyna-guid" ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("dyna-guid");

/***/ }),

/***/ "dyna-logger/node":
/*!***********************************!*\
  !*** external "dyna-logger/node" ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("dyna-logger/node");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),

/***/ "which":
/*!************************!*\
  !*** external "which" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("which");

/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map