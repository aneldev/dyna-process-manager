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
import { guid } from "dyna-guid";
import { EventEmitter } from "events";
import { DynaLogger, } from "dyna-logger";
var EOL = require('os').EOL;
export var EDynaProcessEvent;
(function (EDynaProcessEvent) {
    EDynaProcessEvent["STOP"] = "STOP";
    EDynaProcessEvent["CRASH"] = "CRASH";
    EDynaProcessEvent["CONSOLE_ERROR"] = "CONSOLE_ERROR";
    EDynaProcessEvent["CONSOLE_WARN"] = "CONSOLE_WARN";
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
        _this._config = __assign({ env: {}, consolePrefixProcessName: true, forceTerminationSignal: false }, (_this._config), { loggerSettings: __assign({ bufferLimit: 2000 }, _this._config.loggerSettings) });
        _this.logger = new DynaLogger(_this._config.loggerSettings);
        if (_this._config.command === "node") {
            var resolvedNodeCommand = which.sync('node', { nothrow: true });
            if (resolvedNodeCommand) {
                _this._config.command = resolvedNodeCommand;
            }
            else {
                console.error('DynaProcessManager.DynaProcess cannot locate the node in current instance. "which node" returned null. This leads to 1902250950 error');
            }
        }
        if (_this._config.forceTerminationSignal) {
            // For all termination signals, push the to the child.
            // On some system's like Mac OS Catalina update, the children don't get the termination signal always.
            // https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html#:~:text=The%20(obvious)%20default%20action%20for,cause%20the%20process%20to%20terminate.&text=The%20SIGTERM%20signal%20is%20a,ask%20a%20program%20to%20terminate.
            var terminationSignals = [
                "SIGTERM",
                "SIGINT",
                "SIGQUIT",
                "SIGHUP",
            ];
            (new Array())
                .concat(terminationSignals, terminationSignals.map(function (s) { return s.toLowerCase(); }))
                .forEach(function (signal) {
                process.on(signal, function () {
                    if (!_this._active)
                        return;
                    _this.stop(signal);
                    process.exit(0);
                });
            });
        }
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
    Object.defineProperty(DynaProcess.prototype, "info", {
        get: function () {
            return {
                startedAt: this._startedAt,
                stoppedAt: this._stoppedAt,
                stopCalled: this._stopCalled,
            };
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
            if (!command) {
                reject({
                    code: 1902250950,
                    section: 'DynaProcess/start',
                    message: 'Process cannot start while command is not defined',
                    data: { command: command },
                });
                return;
            }
            try {
                _this._process = cp.spawn(command, applyArgs, {
                    cwd: cwd,
                    env: env,
                });
                _this._active = true;
                _this._process.stdout.on('data', function (text) { return _this._handleOnConsoleLog(text); });
                _this._process.stderr.on('data', function (text) { return _this._handleOnConsoleError(text); });
                _this._process.on('close', function (code, signal) { return _this._handleOnClose(code, signal); });
                _this._process.on('exit', function (code, signal) { return _this._handleOnClose(code, signal); });
                _this._process.on('error', function (error) { return _this._handleProcessError(error); });
                _this._startedAt = new Date();
                _this._stoppedAt = null;
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
        if (signal === void 0) { signal = 'SIGTERM'; }
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
        this._consoleLog(text, true);
    };
    DynaProcess.prototype._handleOnConsoleError = function (chunk) {
        var text = chunk.toString();
        if (this._isTextWarning(text)) {
            this._consoleWarn(text, true, null);
            this.emit(EDynaProcessEvent.CONSOLE_WARN, text);
        }
        else {
            this._consoleError(text, true, null);
            this.emit(EDynaProcessEvent.CONSOLE_ERROR, text);
        }
    };
    DynaProcess.prototype._handleOnClose = function (exitCode, signal) {
        var _this = this;
        if (!this._active)
            return; // is already closed
        var _a = this._config, guard = _a.guard, onClose = _a.onClose;
        // help: https://nodejs.org/api/child_process.html#child_process_event_close
        this._active = false;
        this._stoppedAt = new Date;
        if (exitCode) {
            this._consoleError("Exited with exit code [" + exitCode + "] and signal [" + signal + "]");
            this.emit(EDynaProcessEvent.CRASH, { exitCode: exitCode });
            if (guard) {
                if (!this._stopCalled) {
                    setTimeout(function () {
                        _this._start();
                    }, guard.restartAfterMs);
                }
                else {
                    this.emit(EDynaProcessEvent.STOP);
                    onClose && onClose(exitCode, signal);
                }
            }
            else {
                onClose && onClose(exitCode, signal);
            }
        }
        else {
            this._consoleLog("Stopped. Exited with exit code [" + exitCode + "] and signal [" + signal + "]");
            this.emit(EDynaProcessEvent.STOP);
            onClose && onClose(exitCode, signal);
        }
    };
    DynaProcess.prototype._handleProcessError = function (error) {
        if (this._isErrorWarning(error))
            this._consoleWarn("warning: " + error.message, false, { warn: error, pid: this._process.pid });
        else
            this._consoleError("error: " + error.message, false, { error: error, pid: this._process.pid });
    };
    DynaProcess.prototype._isErrorWarning = function (error) {
        return this._isTextWarning(error.message || '');
    };
    DynaProcess.prototype._isTextWarning = function (text) {
        text = text.toLowerCase();
        return (this._inRange(text.indexOf('warning:'), 0, 30) ||
            this._inRange(text.indexOf('warn:'), 0, 30));
    };
    DynaProcess.prototype._inRange = function (value, from, to) {
        return value >= from && value <= to;
    };
    Object.defineProperty(DynaProcess.prototype, "consolePrefix", {
        get: function () {
            if (!this._config.consolePrefixProcessName)
                return 'Process: ';
            return "Process: " + this._config.name + ":";
        },
        enumerable: true,
        configurable: true
    });
    DynaProcess.prototype._consoleLog = function (message, processSays, data) {
        if (processSays === void 0) { processSays = false; }
        if (data === void 0) { data = {}; }
        message = DynaProcess.cleanProcessConsole(message);
        this.logger.log(this.consolePrefix, "" + (processSays ? '> ' : '') + message, __assign({}, data, { dynaProcessId: this.id }));
    };
    DynaProcess.prototype._consoleWarn = function (message, processSays, data) {
        if (processSays === void 0) { processSays = false; }
        if (data === void 0) { data = {}; }
        message = DynaProcess.cleanProcessConsole(message);
        this.logger.warn(this.consolePrefix, "" + (processSays ? '> ' : '') + message, __assign({}, data, { dynaProcessId: this.id }));
    };
    DynaProcess.prototype._consoleError = function (message, processSays, data) {
        if (processSays === void 0) { processSays = false; }
        if (data === void 0) { data = {}; }
        message = DynaProcess.cleanProcessConsole(message);
        this.logger.error(this.consolePrefix, "" + (processSays ? '> ' : '') + message, __assign({}, data, { dynaProcessId: this.id }));
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