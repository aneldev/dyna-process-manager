import {
  DynaLogger,
  IDynaLoggerConfig,
} from "dyna-logger";
import {
  DynaProcess,
  EDynaProcessEvent,
  IDynaProcessConfig,
} from "./DynaProcess";
import { IError } from "./interfaces";

export interface IDynaProcessManagerConfig {
  loggerSettings?: IDynaLoggerConfig;
}

export { IDynaLoggerConfig };

export class DynaProcessManager {
  constructor(private readonly _config: IDynaProcessManagerConfig = {}) {
    this._config = {
      ...this._config,
      loggerSettings: {
        bufferLimit: 2000,
        ...(this._config.loggerSettings || {}),
      },
    };
    new DynaLogger(this._config.loggerSettings);
  }

  private _processes: { [id: string]: DynaProcess } = {};

  public addProcess(processSetup: IDynaProcessConfig): DynaProcess {
    if (!processSetup.loggerSettings) processSetup.loggerSettings = this._config.loggerSettings;
    const newProcess = new DynaProcess(processSetup);
    this._processes[newProcess.id] = newProcess;
    return newProcess;
  }

  public removeProcess(id: string): Promise<void> {
    return new Promise((resolve: Function, reject: (error: IError) => void) => {
      const process: DynaProcess = this.getProcess(id);

      if (!process) {
        reject({
          section: 'ProcessManager/removeProcess',
          code: 3598644,
          message: 'Process not found with this id',
          data: {id},
        });
        return;
      }

      if (process.active) {
        reject({
          section: 'ProcessManager/removeProcess',
          code: 3598645,
          message: 'Process is working',
          data: {id},
        });
        return;
      }

      delete this._processes[id];
      resolve();
    });
  }

  public getProcess(id: string): DynaProcess {
    return this._processes[id];
  }

  public get count(): number {
    return Object.keys(this._processes).length;
  }

  public stop(id: string): Promise<any> {
    return new Promise((resolve: Function, reject: (error: IError) => void) => {
      const process: DynaProcess = this.getProcess(id);

      if (!process) {
        reject({
          section: 'ProcessManager/stop',
          code: 3598643,
          message: 'Process not found with this id',
          data: {id},
        });
        return; // exit
      }

      if (!process.active) {
        resolve();
        return; // exit
      }

      const handleStop = () => {
        process.off(EDynaProcessEvent.STOP, handleStop);
        resolve();
      };

      const handleCrash = () => {
        process.off(EDynaProcessEvent.CRASH, handleCrash);
        resolve();
      };

      process.on(EDynaProcessEvent.STOP, handleStop);
      process.on(EDynaProcessEvent.CRASH, handleCrash);

      setTimeout(() => {
        process.stop();
      }, 10);
    });
  }

  public stopAll(): Promise<void> {
    return Promise.all(
      Object.keys(this._processes)
        .map((id: string) => this.stop(id)),
    ).then(() => undefined);
  }
}
