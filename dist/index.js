(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("child_process"), require("events"));
	else if(typeof define === 'function' && define.amd)
		define("dyna-process-manager", ["child_process", "events"], factory);
	else if(typeof exports === 'object')
		exports["dyna-process-manager"] = factory(require("child_process"), require("events"));
	else
		root["dyna-process-manager"] = factory(root["child_process"], root["events"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
const cp = __webpack_require__(6);
const events_1 = __webpack_require__(7);
const dyna_guid_1 = __webpack_require__(4);
class DynaProcess extends events_1.EventEmitter {
    constructor(logger, dynaProsessSetup) {
        super();
        this._id = dyna_guid_1.guid(1);
        this._isWorking = false;
        this._process = null;
        this._startedAt = null;
        this._stoppedAt = null;
        this._stopCalled = false;
        this._lastExitCode = null;
        this.events = {
            STOP: 'stop',
            CRASH: 'crash',
            CONSOLE_ERROR: 'console_error',
        };
        this._logger = logger;
        this._setup = Object.assign({ env: {} }, dynaProsessSetup);
    }
    get id() {
        return this._id;
    }
    get isWorking() {
        return this._isWorking;
    }
    get setup() {
        return this._setup;
    }
    // returns true if started and false if it was already started; rejects on errors
    start() {
        this._stopCalled = false;
        return this._start();
    }
    _start() {
        return new Promise((resolve, reject) => {
            const { command, args, cwd, env } = this._setup;
            if (this._isWorking)
                resolve(false);
            try {
                this._process = cp.spawn(command, args, {
                    cwd,
                    env
                });
                this._isWorking = true;
                this._process.stdout.on('data', (text) => this._handleOnConsoleLog(text));
                this._process.stderr.on('data', (text) => this._handleOnConsoleError(text));
                this._process.on('close', (code, signal) => this._handleOnClose(code, signal));
                this._process.on('error', (error) => this._handleProcessError(error));
                this._startedAt = new Date();
                this._stoppedAt = null;
                this._lastExitCode = null;
                resolve(true);
            }
            catch (error) {
                this._isWorking = false;
                reject({
                    section: 'DynaProcess/start',
                    message: 'Process cannot start',
                    error,
                    data: { processSetup: this._setup },
                });
            }
        });
    }
    stop(signal) {
        // help: https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal
        this._stopCalled = true;
        this._process.kill(signal);
    }
    _handleOnConsoleLog(text) {
        this._consoleLog(text, null, true);
    }
    _handleOnConsoleError(text) {
        this._consoleError(text, null, true);
        this.emit(this.events.CONSOLE_ERROR);
    }
    _handleOnClose(exitCode, signal) {
        // help: https://nodejs.org/api/child_process.html#child_process_event_close
        const { guard } = this._setup;
        this._isWorking = false;
        this._stoppedAt = new Date;
        this._lastExitCode = exitCode;
        if (exitCode) {
            this._consoleError(`Crashed! Exited with exit code [${exitCode}] and signal [${signal}]`);
            this.emit(this.events.CRASH, { exitCode });
            if (guard) {
                if (!this._stopCalled) {
                    setTimeout(() => {
                        this._start();
                    }, guard.restartAfterMs || 0);
                }
                else {
                    this.emit(this.events.STOP);
                }
            }
        }
        else {
            this._consoleLog(`Stopped. Exited with exit code [${exitCode}] and signal [${signal}]`);
            this.emit(this.events.STOP);
        }
    }
    _handleProcessError(error) {
        this._consoleError('general error', { error, pid: this._process.pid });
    }
    _consoleLog(message, data = undefined, processSays = false) {
        this._logger.log(`Process: ${this._setup.name} ${this.id}`, `${processSays ? '> ' : ''}${message}`, data);
    }
    _consoleError(message, data = undefined, processSays = false) {
        this._logger.error(`Process: ${this._setup.name} ${this.id}`, `${processSays ? '> ' : ''}${message}`, data);
    }
}
exports.DynaProcess = DynaProcess;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const DynaProcessManager_1 = __webpack_require__(3);
exports.DynaProcessManager = DynaProcessManager_1.DynaProcessManager;
exports.IDynaLoggerSettings = DynaProcessManager_1.IDynaLoggerSettings;
const DynaProcess_1 = __webpack_require__(0);
exports.DynaProcess = DynaProcess_1.DynaProcess;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const dyna_logger_1 = __webpack_require__(5);
exports.IDynaLoggerSettings = dyna_logger_1.ISettings;
const DynaProcess_1 = __webpack_require__(0);
class DynaProcessManager {
    constructor(settings = {}, loggerSettings) {
        this._processes = {};
        this._settings = Object.assign({}, settings);
        loggerSettings = Object.assign({ bufferLimit: 2000 }, loggerSettings);
        this._logger = new dyna_logger_1.DynaLogger(loggerSettings);
    }
    addProcess(processSetup) {
        const newProcess = new DynaProcess_1.DynaProcess(this._logger, processSetup);
        this._processes[newProcess.id] = newProcess;
        return newProcess;
    }
    removeProcess(processId) {
        return new Promise((resolve, reject) => {
            const process = this.getProcess(processId);
            if (!process) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: '3598644',
                    message: 'Process not found with this id',
                    data: { processId },
                });
                return;
            }
            if (process.isWorking) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: '3598645',
                    message: 'Process is working',
                    data: { processId },
                });
                return;
            }
            delete this._processes[processId];
            resolve();
        });
    }
    getProcess(processId) {
        return this._processes[processId];
    }
    get count() {
        return Object.keys(this._processes).length;
    }
    stop(processId) {
        return new Promise((resolve, reject) => {
            const process = this.getProcess(processId);
            if (!process) {
                reject({
                    section: 'ProcessManager/stop',
                    code: '3598643',
                    message: 'Process not found with this id',
                    data: { processId },
                });
                return;
            }
            const resolve_ = () => {
                resolve();
            };
            process.on(process.events.STOP, resolve_);
            process.on(process.events.CRASH, resolve_);
            process.stop();
        });
    }
    stopAll() {
        Object.keys(this._processes).forEach((processId) => this.stop(processId));
    }
}
exports.DynaProcessManager = DynaProcessManager;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function webpackUniversalModuleDefinition(root, factory) {
    if (( false ? 'undefined' : _typeof(exports)) === 'object' && ( false ? 'undefined' : _typeof(module)) === 'object') module.exports = factory();else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') exports["dyna-guid"] = factory();else root["dyna-guid"] = factory();
})(undefined, function () {
    return (/******/function (modules) {
            // webpackBootstrap
            /******/ // The module cache
            /******/var installedModules = {};
            /******/
            /******/ // The require function
            /******/function __webpack_require__(moduleId) {
                /******/
                /******/ // Check if module is in cache
                /******/if (installedModules[moduleId]) {
                    /******/return installedModules[moduleId].exports;
                    /******/
                }
                /******/ // Create a new module (and put it into the cache)
                /******/var module = installedModules[moduleId] = {
                    /******/i: moduleId,
                    /******/l: false,
                    /******/exports: {}
                    /******/ };
                /******/
                /******/ // Execute the module function
                /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                /******/
                /******/ // Flag the module as loaded
                /******/module.l = true;
                /******/
                /******/ // Return the exports of the module
                /******/return module.exports;
                /******/
            }
            /******/
            /******/
            /******/ // expose the modules object (__webpack_modules__)
            /******/__webpack_require__.m = modules;
            /******/
            /******/ // expose the module cache
            /******/__webpack_require__.c = installedModules;
            /******/
            /******/ // identity function for calling harmony imports with the correct context
            /******/__webpack_require__.i = function (value) {
                return value;
            };
            /******/
            /******/ // define getter function for harmony exports
            /******/__webpack_require__.d = function (exports, name, getter) {
                /******/if (!__webpack_require__.o(exports, name)) {
                    /******/Object.defineProperty(exports, name, {
                        /******/configurable: false,
                        /******/enumerable: true,
                        /******/get: getter
                        /******/ });
                    /******/
                }
                /******/
            };
            /******/
            /******/ // getDefaultExport function for compatibility with non-harmony modules
            /******/__webpack_require__.n = function (module) {
                /******/var getter = module && module.__esModule ?
                /******/function getDefault() {
                    return module['default'];
                } :
                /******/function getModuleExports() {
                    return module;
                };
                /******/__webpack_require__.d(getter, 'a', getter);
                /******/return getter;
                /******/
            };
            /******/
            /******/ // Object.prototype.hasOwnProperty.call
            /******/__webpack_require__.o = function (object, property) {
                return Object.prototype.hasOwnProperty.call(object, property);
            };
            /******/
            /******/ // __webpack_public_path__
            /******/__webpack_require__.p = "/dist/";
            /******/
            /******/ // Load entry module and return exports
            /******/return __webpack_require__(__webpack_require__.s = 1);
            /******/
        }(
        /************************************************************************/
        /******/[
        /* 0 */
        /***/function (module, exports, __webpack_require__) {

            "use strict";

            Object.defineProperty(exports, "__esModule", { value: true });
            var random = function random() {
                return Math.floor(1000000000 + Math.random() * 0x10000000 /* 65536 */).toString(18).substr(0, 8);
            };
            exports.guid = function () {
                var blocks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

                var date = new Date();
                var datePart = (Number(date) * 3).toString().split("").reverse().join("");
                var timeZonePart = new Date().getTimezoneOffset();
                if (timeZonePart < 0) {
                    timeZonePart = -timeZonePart;
                    timeZonePart = '7' + timeZonePart;
                } else {
                    timeZonePart = '3' + timeZonePart;
                }
                var output = '';
                for (var i = 0; i < blocks; i++) {
                    output += random() + '-';
                }output += datePart;
                output += timeZonePart;
                return output;
            };

            /***/
        },
        /* 1 */
        /***/function (module, exports, __webpack_require__) {

            module.exports = __webpack_require__(0);

            /***/
        }]
        /******/)
    );
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function webpackUniversalModuleDefinition(root, factory) {
  if (( false ? 'undefined' : _typeof(exports)) === 'object' && ( false ? 'undefined' : _typeof(module)) === 'object') module.exports = factory();else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') exports["dyna-logger"] = factory();else root["dyna-logger"] = factory();
})(undefined, function () {
  return (/******/function (modules) {
      // webpackBootstrap
      /******/ // The module cache
      /******/var installedModules = {};
      /******/
      /******/ // The require function
      /******/function __webpack_require__(moduleId) {
        /******/
        /******/ // Check if module is in cache
        /******/if (installedModules[moduleId]) {
          /******/return installedModules[moduleId].exports;
          /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/var module = installedModules[moduleId] = {
          /******/i: moduleId,
          /******/l: false,
          /******/exports: {}
          /******/ };
        /******/
        /******/ // Execute the module function
        /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ // Flag the module as loaded
        /******/module.l = true;
        /******/
        /******/ // Return the exports of the module
        /******/return module.exports;
        /******/
      }
      /******/
      /******/
      /******/ // expose the modules object (__webpack_modules__)
      /******/__webpack_require__.m = modules;
      /******/
      /******/ // expose the module cache
      /******/__webpack_require__.c = installedModules;
      /******/
      /******/ // identity function for calling harmony imports with the correct context
      /******/__webpack_require__.i = function (value) {
        return value;
      };
      /******/
      /******/ // define getter function for harmony exports
      /******/__webpack_require__.d = function (exports, name, getter) {
        /******/if (!__webpack_require__.o(exports, name)) {
          /******/Object.defineProperty(exports, name, {
            /******/configurable: false,
            /******/enumerable: true,
            /******/get: getter
            /******/ });
          /******/
        }
        /******/
      };
      /******/
      /******/ // getDefaultExport function for compatibility with non-harmony modules
      /******/__webpack_require__.n = function (module) {
        /******/var getter = module && module.__esModule ?
        /******/function getDefault() {
          return module['default'];
        } :
        /******/function getModuleExports() {
          return module;
        };
        /******/__webpack_require__.d(getter, 'a', getter);
        /******/return getter;
        /******/
      };
      /******/
      /******/ // Object.prototype.hasOwnProperty.call
      /******/__webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/
      /******/ // __webpack_public_path__
      /******/__webpack_require__.p = "/dist/";
      /******/
      /******/ // Load entry module and return exports
      /******/return __webpack_require__(__webpack_require__.s = 2);
      /******/
    }(
    /************************************************************************/
    /******/[
    /* 0 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });
      var eventemitter3_1 = __webpack_require__(1);

      var DynaLogger = function (_eventemitter3_1$Even) {
        _inherits(DynaLogger, _eventemitter3_1$Even);

        function DynaLogger() {
          var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          _classCallCheck(this, DynaLogger);

          var _this = _possibleConstructorReturn(this, (DynaLogger.__proto__ || Object.getPrototypeOf(DynaLogger)).call(this));

          _this._logs = [];
          _this.events = {
            log: 'log'
          };
          _this.types = {
            log: 'log',
            info: 'info',
            error: 'error',
            warn: 'warn',
            debug: 'debug'
          };
          _this._settings = Object.assign({ bufferLimit: 5000, consoleLogs: true, consoleInfoLogs: true, consoleErrorLogs: true, consoleWarnLogs: true, consoleDebugLogs: true, keepLogs: true, keepInfoLogs: true, keepErrorLogs: true, keepWarnLogs: true, keepDebugLogs: true }, settings);
          if (typeof settings.bufferLimit === 'undefined') _this.info('DynaLogger', 'bufferLimit not assigned, default is 5000 logs');
          return _this;
        }

        _createClass(DynaLogger, [{
          key: 'log',
          value: function log(section, message) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this._log('log', section, message, data);
          }
        }, {
          key: 'info',
          value: function info(section, message) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this._log('info', section, message, data);
          }
        }, {
          key: 'error',
          value: function error(section, message) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this._log('error', section, message, data);
          }
        }, {
          key: 'warn',
          value: function warn(section, message) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this._log('warn', section, message, data);
          }
        }, {
          key: 'debug',
          value: function debug(section, message) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this._log('debug', section, message, data);
          }
        }, {
          key: 'clear',
          value: function clear(type) {
            if (type) this._logs = this.logs.filter(function (log) {
              return log.type !== type;
            });else this._logs = [];
          }
        }, {
          key: '_log',
          value: function _log(type, section) {
            var _console, _console2, _console3, _console4;

            var text_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
            var data = arguments[3];

            var now = new Date();
            var text = this._createMessage(section, type, text_, now);
            var log = { date: now, type: type, text: text, data: data };
            var consoleParams = [text];
            if (data) consoleParams.push(data);
            if (type == 'log' && this._settings.keepLogs) this._logs.push(log);
            if (type == 'info' && this._settings.keepInfoLogs) this._logs.push(log);
            if (type == 'error' && this._settings.keepErrorLogs) this._logs.push(log);
            if (type == 'warn' && this._settings.keepWarnLogs) this._logs.push(log);
            if (type == 'debug' && this._settings.keepDebugLogs) this._logs.push(log);
            if (type == 'log' && this._settings.consoleLogs) (_console = console).log.apply(_console, consoleParams);
            if (type == 'info' && this._settings.consoleInfoLogs) (_console2 = console).log.apply(_console2, consoleParams);
            if (type == 'error' && this._settings.consoleErrorLogs) (_console3 = console).error.apply(_console3, consoleParams);
            if (type == 'warn' && this._settings.consoleWarnLogs) (_console4 = console).warn.apply(_console4, consoleParams);
            if (type == 'debug' && this._settings.consoleDebugLogs) (console.debug || console.log).apply(undefined, consoleParams);
            while (this._logs.length > this._settings.bufferLimit) {
              this._logs.shift();
            }this.emit(this.events.log, log);
          }
        }, {
          key: '_createMessage',
          value: function _createMessage(section, type, text, date) {
            return '[' + section + '] ' + date.toLocaleString() + ' (' + type + ')' + (text ? ' ' + text : '');
          }
        }, {
          key: 'logs',
          get: function get() {
            return [].concat(this._logs);
          }
        }]);

        return DynaLogger;
      }(eventemitter3_1.EventEmitter);

      exports.DynaLogger = DynaLogger;

      /***/
    },
    /* 1 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      var has = Object.prototype.hasOwnProperty,
          prefix = '~';

      /**
       * Constructor to create a storage for our `EE` objects.
       * An `Events` instance is a plain object whose properties are event names.
       *
       * @constructor
       * @api private
       */
      function Events() {}

      //
      // We try to not inherit from `Object.prototype`. In some engines creating an
      // instance in this way is faster than calling `Object.create(null)` directly.
      // If `Object.create(null)` is not supported we prefix the event names with a
      // character to make sure that the built-in object properties are not
      // overridden or used as an attack vector.
      //
      if (Object.create) {
        Events.prototype = Object.create(null);

        //
        // This hack is needed because the `__proto__` property is still inherited in
        // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
        //
        if (!new Events().__proto__) prefix = false;
      }

      /**
       * Representation of a single event listener.
       *
       * @param {Function} fn The listener function.
       * @param {Mixed} context The context to invoke the listener with.
       * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
       * @constructor
       * @api private
       */
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }

      /**
       * Minimal `EventEmitter` interface that is molded against the Node.js
       * `EventEmitter` interface.
       *
       * @constructor
       * @api public
       */
      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }

      /**
       * Return an array listing the events for which the emitter has registered
       * listeners.
       *
       * @returns {Array}
       * @api public
       */
      EventEmitter.prototype.eventNames = function eventNames() {
        var names = [],
            events,
            name;

        if (this._eventsCount === 0) return names;

        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }

        return names;
      };

      /**
       * Return the listeners registered for a given event.
       *
       * @param {String|Symbol} event The event name.
       * @param {Boolean} exists Only check if there are listeners.
       * @returns {Array|Boolean}
       * @api public
       */
      EventEmitter.prototype.listeners = function listeners(event, exists) {
        var evt = prefix ? prefix + event : event,
            available = this._events[evt];

        if (exists) return !!available;
        if (!available) return [];
        if (available.fn) return [available.fn];

        for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
          ee[i] = available[i].fn;
        }

        return ee;
      };

      /**
       * Calls each of the listeners registered for a given event.
       *
       * @param {String|Symbol} event The event name.
       * @returns {Boolean} `true` if the event had listeners, else `false`.
       * @api public
       */
      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return false;

        var listeners = this._events[evt],
            len = arguments.length,
            args,
            i;

        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }

          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }

          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length,
              j;

          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }

                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }

        return true;
      };

      /**
       * Add a listener for a given event.
       *
       * @param {String|Symbol} event The event name.
       * @param {Function} fn The listener function.
       * @param {Mixed} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @api public
       */
      EventEmitter.prototype.on = function on(event, fn, context) {
        var listener = new EE(fn, context || this),
            evt = prefix ? prefix + event : event;

        if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

        return this;
      };

      /**
       * Add a one-time listener for a given event.
       *
       * @param {String|Symbol} event The event name.
       * @param {Function} fn The listener function.
       * @param {Mixed} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @api public
       */
      EventEmitter.prototype.once = function once(event, fn, context) {
        var listener = new EE(fn, context || this, true),
            evt = prefix ? prefix + event : event;

        if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

        return this;
      };

      /**
       * Remove the listeners of a given event.
       *
       * @param {String|Symbol} event The event name.
       * @param {Function} fn Only remove the listeners that match this function.
       * @param {Mixed} context Only remove the listeners that have this context.
       * @param {Boolean} once Only remove one-time listeners.
       * @returns {EventEmitter} `this`.
       * @api public
       */
      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return this;
        if (!fn) {
          if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
          return this;
        }

        var listeners = this._events[evt];

        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }

          //
          // Reset the array, or remove it completely if we have no more listeners.
          //
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
        }

        return this;
      };

      /**
       * Remove all listeners, or those of the specified event.
       *
       * @param {String|Symbol} [event] The event name.
       * @returns {EventEmitter} `this`.
       * @api public
       */
      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;

        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) {
            if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
          }
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }

        return this;
      };

      //
      // Alias methods names because people roll like that.
      //
      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on;

      //
      // This function doesn't apply anymore.
      //
      EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
        return this;
      };

      //
      // Expose the prefix.
      //
      EventEmitter.prefixed = prefix;

      //
      // Allow `EventEmitter` to be imported as module namespace.
      //
      EventEmitter.EventEmitter = EventEmitter;

      //
      // Expose the module.
      //
      if (true) {
        module.exports = EventEmitter;
      }

      /***/
    },
    /* 2 */
    /***/function (module, exports, __webpack_require__) {

      module.exports = __webpack_require__(0);

      /***/
    }]
    /******/)
  );
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ })
/******/ ]);
});