# DynaProcessManager(config?: IDynaProcessManagerConfig)

```
interface IDynaProcessManagerConfig {
  loggerSettings?: IDynaLoggerConfig;
}
```
[IDynaLoggerConfig](https://github.com/aneldev/dyna-logger/blob/master/src/index.ts#L3)

## public addProcess(processSetup: IDynaProcessConfig): DynaProcess

```
interface IDynaProcessConfig {
  name: string;               // The name if this process for console messages and stats
  cwd: string;                // Current working directory of the child process
  command: string;            // Full executable filename
  args?: string | string[];   // Arguments
  env?: any;                  // Environment key-value pairs
  guard?: IDynaProcessConfigGuard;
  loggerSettings?: IDynaLoggerSettings;
  consolePrefixProcessName?: boolean; // default: true
  onClose?: (exitCode: number, signal: string) => void;
}

interface IDynaProcessConfigGuard {
  restartAfterMs: number;
}

```

`addProcess` returns the insatnce of the `DynaProcess` where this has the `id` property (string). Use this `id` in the below methods. 

## public removeProcess(id: string): Promise<void>

## public getProcess(id: string): DynaProcess

## public get count(): number

## public stopAll(): Promise<void>

# DynaProcess

You don't instantiate this, this is the result of the `addProcess`.

You get this from `getProcess` by its `id`.

## logger: DynaLogger

## get id(): string

## public active: boolean

## get info()

Returns startAt, stoppedAt and stopCalled

## start(): Promise<boolean>

Returns true if started and false if it was already started.

The process is started automatically on `addProcess`.

You can use this if you to re-start it later.

## stop(signal?: string): void

# Pass object to new instances

Classes needs at list an config/opt/settings object to start and work. 
Since this will start in new process, you can pass only string arguments.

There two utils provided from the library that can help you to serialize/deserialize an object.
 
## encodeDataToString = <TData>(data: TData): string

Converts an object to string. 

Pass this string as argument to the process and read it from the `process.argv`.

Then `decodeStringToData`.

## decodeStringToData = <TData>(encoded: string): TData

Converts a string to object.
 