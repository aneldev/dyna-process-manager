/// <reference types="node" />
import { EventEmitter } from "events";
import { DynaLogger, IDynaLoggerConfig } from "dyna-logger";
export interface IDynaProcessConfig {
    name: string;
    cwd: string;
    command: string;
    args?: string | string[];
    env?: any;
    guard?: IDynaProcessConfigGuard;
    loggerSettings?: IDynaLoggerConfig;
}
export interface IDynaProcessConfigGuard {
    restartAfterMs: number;
}
export declare enum EDynaProcessEvent {
    STOP = "STOP",
    CRASH = "CRASH",
    CONSOLE_ERROR = "CONSOLE_ERROR"
}
export declare class DynaProcess extends EventEmitter {
    private readonly _config;
    constructor(_config: IDynaProcessConfig);
    private _id;
    private _active;
    private _process;
    private _startedAt;
    private _stoppedAt;
    private _stopCalled;
    private _lastExitCode;
    logger: DynaLogger;
    readonly id: string;
    readonly active: boolean;
    start(): Promise<boolean>;
    _start(): Promise<boolean>;
    stop(signal?: string): void;
    private _handleOnConsoleLog;
    private _handleOnConsoleError;
    private _handleOnClose;
    private _handleProcessError;
    private _consoleLog;
    private _consoleError;
    private static cleanProcessConsole;
}
