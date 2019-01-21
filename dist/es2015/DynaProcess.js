var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
import * as cp from "child_process";
import * as which from "which";
import { EventEmitter } from "events";
import { guid } from "dyna-guid";
import { DynaLogger } from "dyna-logger";
var EOL = require('os').EOL;
export var EDynaProcessEvent;
(function (EDynaProcessEvent) {
    EDynaProcessEvent["STOP"] = "STOP";
    EDynaProcessEvent["CRASH"] = "CRASH";
    EDynaProcessEvent["CONSOLE_ERROR"] = "CONSOLE_ERROR";
})(EDynaProcessEvent || (EDynaProcessEvent = {}));
var DynaProcess = /** @class */ (function (_super) {
    __extends(DynaProcess, _super);
    function DynaProcess(_config) {
        var _this = _super.call(this) || this;
        _this._config = _config;
        _this._id = guid(1);
        _this._active = false;
        _this._startedAt = null;
        _this._stoppedAt = null;
        _this._stopCalled = false;
        _this._lastExitCode = null;
        _this._config = __assign({ env: {} }, (_this._config), { loggerSettings: __assign({ bufferLimit: 2000 }, _this._config.loggerSettings) });
        _this.logger = new DynaLogger(_this._config.loggerSettings);
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
        try {
            this._process.kill(signal);
        }
        catch (error) {
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
            text = text.slice(0, -EOL.length);
        return text;
    };
    return DynaProcess;
}(EventEmitter));
export { DynaProcess };
//# sourceMappingURL=DynaProcess.js.map