import { ISettings as IDynaLoggerSettings } from 'dyna-logger';
import { DynaProcess, IDynaProcessSetup } from './DynaProcess';
export interface ISettings {
}
export { IDynaLoggerSettings };
export declare class DynaProcessManager {
    constructor(settings: ISettings, loggerSettings: IDynaLoggerSettings);
    private _settings;
    private _logger;
    private _processes;
    addProcess(processSetup: IDynaProcessSetup): DynaProcess;
    removeProcess(processId: string): Promise<void>;
    getProcess(processId: string): DynaProcess;
    readonly count: number;
    stop(processId: string): Promise<any>;
    stopAll(): void;
}
