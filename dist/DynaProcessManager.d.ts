import { IDynaLoggerConfig } from "dyna-logger/node";
import { DynaProcess, IDynaProcessConfig } from "./DynaProcess";
export interface IDynaProcessManagerConfig {
    loggerSettings?: IDynaLoggerConfig;
}
export { IDynaLoggerConfig };
export declare class DynaProcessManager {
    private readonly _config;
    constructor(_config?: IDynaProcessManagerConfig);
    private _logger;
    private _processes;
    addProcess(processSetup: IDynaProcessConfig): DynaProcess;
    removeProcess(processId: string): Promise<void>;
    getProcess(processId: string): DynaProcess;
    readonly count: number;
    stop(processId: string): Promise<any>;
    stopAll(): Promise<void>;
}
