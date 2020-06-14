import { IDynaLoggerConfig } from "dyna-logger";
import { DynaProcess, IDynaProcessConfig } from "./DynaProcess";
export interface IDynaProcessManagerConfig {
    loggerSettings?: IDynaLoggerConfig;
}
export { IDynaLoggerConfig };
export declare class DynaProcessManager {
    private readonly _config;
    constructor(_config?: IDynaProcessManagerConfig);
    private _processes;
    addProcess(processSetup: IDynaProcessConfig): DynaProcess;
    removeProcess(id: string): Promise<void>;
    getProcess(id: string): DynaProcess;
    readonly count: number;
    stop(id: string): Promise<any>;
    stopAll(): Promise<void>;
}
