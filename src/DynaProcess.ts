// help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
import * as cp from "child_process";
import * as which from "which";

import {guid} from "dyna-guid";
import {EventEmitter} from "events";
import {DynaLogger, IDynaLoggerConfig} from "dyna-logger";

import {IError} from "./interfaces";

const EOL: string = require('os').EOL;

export interface IDynaProcessConfig {
  name: string;               // name this process for console messages and stats
  cwd: string;                // Current working directory of the child process
  command: string | null;     // full executable filename
  args?: string | string[];   // arguments
  env?: any;                  // Environment key-value pairs
  guard?: IDynaProcessConfigGuard;
  loggerSettings?: IDynaLoggerConfig;
  onClose?: (exitCode: number, signal: string) => void;
}

export interface IDynaProcessConfigGuard {
  restartAfterMs: number;
}

export enum EDynaProcessEvent {
  STOP = 'STOP',                   // process terminated normally (exit code == 0)
  CRASH = 'CRASH',                 // process terminated due to exception (exit code!== 0)
  CONSOLE_ERROR = 'CONSOLE_ERROR', // errors detected from console.errors of the process
  CONSOLE_WARN = 'CONSOLE_WARN',
}

export class DynaProcess extends EventEmitter {
  constructor(private readonly _config: IDynaProcessConfig) {
    super();

    this._config = {
      env: {},
      ...(this._config),
      loggerSettings: {
        bufferLimit: 2000,
        ...this._config.loggerSettings,
      },
    };

    this.logger = new DynaLogger(this._config.loggerSettings);

    if (this._config.command === "node") {
      this._config.command = which.sync('node', {nothrow: true});
      if (!this._config.command) {
        console.error('DynaProcessManager.DynaProcess cannot locate the node in current instance. "which node" returned null. This leads to 1902250950 error');
      }
    }
  }

  private _id: string = guid(1);
  private _active: boolean = false;
  private _process: cp.ChildProcess;
  private _startedAt: Date | null= null;
  private _stoppedAt: Date | null= null;
  private _stopCalled: boolean = false;

  public logger: DynaLogger;

  public get id(): string {
    return this._id;
  }

  public get active(): boolean {
    return this._active;
  }

  // returns true if started and false if it was already started; rejects on errors
  public start(): Promise<boolean> {
    this._stopCalled = false;
    return this._start();
  }

  public _start(): Promise<boolean> {
    return new Promise((resolve: (started: boolean) => void, reject: (error: IError) => void) => {
      const {command, args, cwd, env} = this._config;
      let applyArgs: string[] =
        Array.isArray(args)
          ? args
          : (args as string).split(' ').filter(a => !!a);

      if (this._active) resolve(false);
      if (!command) {
        reject({
          code: 1902250950,
          section: 'DynaProcess/start',
          message: 'Process cannot start while command is not defined',
          data: {command},
        } as IError);
        return;
      }

      try {
        this._process = cp.spawn(
          command,
          applyArgs,
          {
            cwd,
            env
          }
        );

        this._active = true;

        this._process.stdout.on('data', (text: string) => this._handleOnConsoleLog(text));
        this._process.stderr.on('data', (text: string) => this._handleOnConsoleError(text));
        this._process.on('close', (code: number, signal: string) => this._handleOnClose(code, signal));
        this._process.on('exit', (code: number, signal: string) => this._handleOnClose(code, signal));
        this._process.on('error', (error: any) => this._handleProcessError(error));

        this._startedAt = new Date();
        this._stoppedAt = null;
        resolve(true);
      }
      catch (error) {
        this._active = false;
        reject({
          section: 'DynaProcess/start',
          message: 'Process cannot start',
          error,
          data: {processSetup: this._config},
        } as IError)
      }
    });
  }

  public stop(signal?: string): void {
    // help: https://nodejs.org/api/child_process.html#child_process_subprocess_kill_signal
    this._stopCalled = true;
    try {
      this._process.kill(signal);
    }
    catch (error) {
      this.emit(EDynaProcessEvent.CRASH, error);
    }
  }

  private _handleOnConsoleLog(text: string): void {
    this._consoleLog(text, true);
  }

  private _handleOnConsoleError(chunk: any): void {
    const text = chunk.toString();
    if (this._isTextWarning(text)) {
      this._consoleWarn(text, true, null);
      this.emit(EDynaProcessEvent.CONSOLE_WARN, text);
    }
    else {
      this._consoleError(text, true, null);
      this.emit(EDynaProcessEvent.CONSOLE_ERROR, text);
    }
  }

  private _handleOnClose(exitCode: number, signal: string): void {
    if (!this._active) return; // is already exited
    const {guard, onClose} = this._config;

    // help: https://nodejs.org/api/child_process.html#child_process_event_close

    this._active = false;
    this._stoppedAt = new Date;

    if (exitCode) {
      this._consoleError(`Crashed! Exited with exit code [${exitCode}] and signal [${signal}]`);
      this.emit(EDynaProcessEvent.CRASH, {exitCode});
      if (guard) {
        if (!this._stopCalled) {
          setTimeout(() => {
            this._start();
          }, guard.restartAfterMs || 0);
        }
        else {
          this.emit(EDynaProcessEvent.STOP);
          onClose && onClose(exitCode, signal);
        }
      }
    }
    else {
      this._consoleLog(`Stopped. Exited with exit code [${exitCode}] and signal [${signal}]`);
      this.emit(EDynaProcessEvent.STOP);
      onClose && onClose(exitCode, signal);
    }
  }

  private _handleProcessError(error: Error): void {
    if (this._isErrorWarning(error))
      this._consoleWarn(`warning: ${error.message}`, false, {warn: error, pid: this._process.pid});
    else
      this._consoleError(`error: ${error.message}`, false, {error, pid: this._process.pid});
  }

  private _isErrorWarning(error: Error): boolean {
    return this._isTextWarning(error.message || '');
  }

  private _isTextWarning(text: string): boolean {
    text = text.toLowerCase();
    return (
      this._inRange(text.indexOf('warning:'), 0, 30) ||
      this._inRange(text.indexOf('warn:'), 0, 30)
    );
  }

  private _inRange(value: number, from: number, to: number): boolean {
    return value >= from && value <= to;
  }

  private _consoleLog(message: string, processSays: boolean = false, data: any = {}): void {
    message = DynaProcess.cleanProcessConsole(message);
    this.logger.log(`Process: ${this._config.name}`, `${processSays ? '> ' : ''}${message}`, {...data, dynaProgressId: this.id})
  }

  private _consoleWarn(message: string, processSays: boolean = false, data: any = {}): void {
    message = DynaProcess.cleanProcessConsole(message);
    this.logger.warn(`Process: ${this._config.name}`, `${processSays ? '> ' : ''}${message}`, {...data, dynaProgressId: this.id});
  }

  private _consoleError(message: string, processSays: boolean = false, data: any = {}): void {
    message = DynaProcess.cleanProcessConsole(message);
    this.logger.error(`Process: ${this._config.name}`, `${processSays ? '> ' : ''}${message}`, {...data, dynaProgressId: this.id});
  }

  private static cleanProcessConsole(text: any): string {
    text = text.toString();
    if (text.endsWith(EOL)) text = text.slice(0, -EOL.length);
    return text;
  }
}
