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
import { DynaLogger, } from "dyna-logger";
import { DynaProcess, EDynaProcessEvent, } from "./DynaProcess";
var DynaProcessManager = /** @class */ (function () {
    function DynaProcessManager(_config) {
        if (_config === void 0) { _config = {}; }
        this._config = _config;
        this._processes = {};
        this._config = __assign({}, this._config, { loggerSettings: __assign({ bufferLimit: 2000 }, (this._config.loggerSettings || {})) });
        new DynaLogger(this._config.loggerSettings);
    }
    DynaProcessManager.prototype.addProcess = function (processSetup) {
        if (!processSetup.loggerSettings)
            processSetup.loggerSettings = this._config.loggerSettings;
        var newProcess = new DynaProcess(processSetup);
        this._processes[newProcess.id] = newProcess;
        return newProcess;
    };
    DynaProcessManager.prototype.removeProcess = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var process = _this.getProcess(id);
            if (!process) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: 3598644,
                    message: 'Process not found with this id',
                    data: { id: id },
                });
                return;
            }
            if (process.active) {
                reject({
                    section: 'ProcessManager/removeProcess',
                    code: 3598645,
                    message: 'Process is working',
                    data: { id: id },
                });
                return;
            }
            delete _this._processes[id];
            resolve();
        });
    };
    DynaProcessManager.prototype.getProcess = function (id) {
        return this._processes[id];
    };
    Object.defineProperty(DynaProcessManager.prototype, "count", {
        get: function () {
            return Object.keys(this._processes).length;
        },
        enumerable: true,
        configurable: true
    });
    DynaProcessManager.prototype.stop = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var process = _this.getProcess(id);
            if (!process) {
                reject({
                    section: 'ProcessManager/stop',
                    code: 3598643,
                    message: 'Process not found with this id',
                    data: { id: id },
                });
                return; // exit
            }
            if (!process.active) {
                resolve();
                return; // exit
            }
            var handleStop = function () {
                process.off(EDynaProcessEvent.STOP, handleStop);
                resolve();
            };
            var handleCrash = function () {
                process.off(EDynaProcessEvent.CRASH, handleCrash);
                resolve();
            };
            process.on(EDynaProcessEvent.STOP, handleStop);
            process.on(EDynaProcessEvent.CRASH, handleCrash);
            setTimeout(function () {
                process.stop();
            }, 10);
        });
    };
    DynaProcessManager.prototype.stopAll = function () {
        var _this = this;
        return Promise.all(Object.keys(this._processes)
            .map(function (id) { return _this.stop(id); })).then(function () { return undefined; });
    };
    return DynaProcessManager;
}());
export { DynaProcessManager };
//# sourceMappingURL=DynaProcessManager.js.map