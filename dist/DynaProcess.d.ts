/// <reference types="node" />
import { EventEmitter } from 'events';
import { DynaLogger } from "dyna-logger/dist";
export interface IDynaProcessSetup {
    name: string;
    cwd: string;
    command: string;
    args?: string[];
    env?: any;
    guard?: IDynaProcessSetupGuard;
}
export interface IDynaProcessSetupGuard {
    restartAfterMs: number;
}
export declare class DynaProcess extends EventEmitter {
    constructor(logger: DynaLogger, dynaProsessSetup: IDynaProcessSetup);
    private _id;
    private _logger;
    private _setup;
    private _isWorking;
    private _process;
    private _startedAt;
    private _stoppedAt;
    private _stopCalled;
    private _lastExitCode;
    events: any;
    readonly id: string;
    readonly isWorking: boolean;
    readonly setup: IDynaProcessSetup;
    start(): Promise<boolean>;
    _start(): Promise<boolean>;
    stop(signal?: string): void;
    private _handleOnConsoleLog(text);
    private _handleOnConsoleError(text);
    private _handleOnClose(exitCode, signal);
    private _handleProcessError(error);
    private _consoleLog(message, data?, processSays?);
    private _consoleError(message, data?, processSays?);
}
