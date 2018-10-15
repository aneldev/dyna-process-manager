import {DynaLogger, IDynaLoggerConfig}                      from 'dyna-logger';
import {DynaProcess, EDynaProcessEvent, IDynaProcessConfig} from './DynaProcess';
import {IError}                                             from "./interfaces";

export interface IDynaProcessManagerConfig {
  loggerSettings?: IDynaLoggerConfig;
}

export {IDynaLoggerConfig};

export class DynaProcessManager {
  constructor(private readonly _config: IDynaProcessManagerConfig = {}) {
    this._config = {
      ...this._config,
      loggerSettings: {
        bufferLimit: 2000,
        ...(this._config.loggerSettings || {}),
      },
    };
    this._logger = new DynaLogger(this._config.loggerSettings);
  }

  private _logger: DynaLogger;
  private _processes: { [id: string]: DynaProcess } = {};

  public addProcess(processSetup: IDynaProcessConfig): DynaProcess {
    if (!processSetup.loggerSettings) processSetup.loggerSettings = this._config.loggerSettings;
    const newProcess = new DynaProcess(processSetup);
    this._processes[newProcess.id] = newProcess;
    return newProcess;
  }

  public removeProcess(processId: string): Promise<void> {
    return new Promise((resolve: Function, reject: (error: IError) => void) => {
      const process: DynaProcess = this.getProcess(processId);

      if (!process) {
        reject({
          section: 'ProcessManager/removeProcess',
          code: '3598644',
          message: 'Process not found with this id',
          data: {processId},
        });
        return;
      }

      if (process.active) {
        reject({
          section: 'ProcessManager/removeProcess',
          code: '3598645',
          message: 'Process is working',
          data: {processId},
        });
        return;
      }

      delete this._processes[processId];
      resolve();
    });
  }

  public getProcess(processId: string): DynaProcess {
    return this._processes[processId];
  }

  public get count(): number {
    return Object.keys(this._processes).length;
  }

  public stop(processId: string): Promise<any> {
    return new Promise((resolve: Function, reject: (error: IError) => void) => {
      const process: DynaProcess = this.getProcess(processId);

      if (!process) {
        reject({
          section: 'ProcessManager/stop',
          code: '3598643',
          message: 'Process not found with this id',
          data: {processId},
        });
        return;
      }

      const resolve_ = () => {
        resolve();
      };

      process.on(EDynaProcessEvent.STOP, resolve_);
      process.on(EDynaProcessEvent.CRASH, resolve_);

      process.stop();
    });
  }

  public stopAll(): Promise<void> {
    return Promise.all(
      Object.keys(this._processes)
        .map((processId: string) => this.stop(processId))
    ).then(() => undefined);
  }
}
