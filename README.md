# DynaProcessManager(config?: IDynaProcessManagerConfig)

```
interface IDynaProcessManagerConfig {
  loggerSettings?: IDynaLoggerConfig;
}
```
[IDynaLoggerConfig](https://github.com/aneldev/dyna-logger/blob/master/src/index.ts#L3)

## public addProcess(processSetup: IDynaProcessConfig): DynaProcess

## public removeProcess(processId: string): Promise<void>

## public getProcess(processId: string): DynaProcess

## public get count(): number

## public stopAll(): Promise<void>

# DynaProcessManager

You don't instantiate this, this is the result of the `addProcess`.

You get this from `getProcess` by its `id`.

## public logger: DynaLogger

## public id: string

## public active: boolean

## public start(): Promise<boolean>

Returns true if started and false if it was already started.

The process is started automatically on `addProcess`.

You can use this if you to re-start it later.

## public stop(signal?: string): void
