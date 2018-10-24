// help: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
import * as cp                         from 'child_process';
import * as which                      from "which";
import {IError}                        from "./interfaces";
import {EventEmitter}                  from 'events';
import {guid}                          from "dyna-guid";
import {DynaLogger, IDynaLoggerConfig} from "dyna-logger";

const EOL: string = require('os').EOL;

export interface IDynaProcessConfig {
  name: string;               // name this process for console messages and stats
  cwd: string;                // Current working directory of the child process
  command: string;            // full executable filename
  args?: string | string[];   // arguments
  env?: any;                  // Environment key-value pairs
  guard?: IDynaProcessConfigGuard;
  loggerSettings?: IDynaLoggerConfig;
}

export interface IDynaProcessConfigGuard {
  restartAfterMs: number;
}

export enum EDynaProcessEvent {
  STOP = 'STOP',                   // process terminated normally (exit code == 0)
  CRASH = 'CRASH',                 // process terminated due to exception (exit code!== 0)
  CONSOLE_ERROR = 'CONSOLE_ERROR', // errors detected from console.errors of the process
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

    if (this._config.command === "node") this._config.command = which.sync('node', {nothrow: true});
  }

  private _id: string = guid(1);
  private _active: boolean = false;
  private _process: cp.ChildProcess = null;
  private _startedAt: Date = null;
  private _stoppedAt: Date = null;
  private _stopCalled: boolean = false;
  private _lastExitCode: number = null;

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
        this._process.on('error', (error: any) => this._handleProcessError(error));

        this._startedAt = new Date();
        this._stoppedAt = null;
        this._lastExitCode = null;
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
    this._process.kill(signal);
  }

  private _handleOnConsoleLog(text: string): void {
    this._consoleLog(text, null, true);
  }

  private _handleOnConsoleError(text: string): void {
    this._consoleError(text, null, true);
    this.emit(EDynaProcessEvent.CONSOLE_ERROR);
  }

  private _handleOnClose(exitCode: number, signal: string): void {
    // help: https://nodejs.org/api/child_process.html#child_process_event_close
    const {guard} = this._config;

    this._active = false;
    this._stoppedAt = new Date;
    this._lastExitCode = exitCode;

    if (exitCode) {
      this._consoleError(`Crashed! Exited with exit code [${exitCode}] and signal [${signal}]`,);
      this.emit(EDynaProcessEvent.CRASH, {exitCode});
      if (guard) {
        if (!this._stopCalled) {
          setTimeout(() => {
            this._start();
          }, guard.restartAfterMs || 0);
        }
        else {
          this.emit(EDynaProcessEvent.STOP);
        }
      }
    }
    else {
      this._consoleLog(`Stopped. Exited with exit code [${exitCode}] and signal [${signal}]`);
      this.emit(EDynaProcessEvent.STOP);
    }
  }

  private _handleProcessError(error: any): void {
    this._consoleError('general error', {error, pid: this._process.pid});
  }

  private _consoleLog(message: string, data: any = undefined, processSays: boolean = false): void {
    message = DynaProcess.cleanProcessConsole(message);
    this.logger.log(`Process: ${this._config.name} ${this.id}`, `${processSays ? '> ' : ''}${message}`, data)
  }

  private _consoleError(message: string, data: any = undefined, processSays: boolean = false): void {
    message = DynaProcess.cleanProcessConsole(message);
    this.logger.error(`Process: ${this._config.name} ${this.id}`, `${processSays ? '> ' : ''}${message}`, data)
  }

  private static cleanProcessConsole(text: any): string {
    text=text.toString();
    if (text.endsWith(EOL)) text=text.slice(0, -EOL.length);
    return text;
  }
}
