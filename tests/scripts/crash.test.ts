declare let jasmine: any, describe: any, expect: any, it: any;

const STRESS_TEST: boolean = false;
const ITEM_TIMEOUT_MS: number = 40;
const NORMAL_ITEMS_COUNT: number = 2;
const STRESS_ITEMS_COUNT: number = 200;

const ITEMS_COUNT: number = STRESS_TEST && STRESS_ITEMS_COUNT || NORMAL_ITEMS_COUNT;
let timeout = (STRESS_TEST && STRESS_ITEMS_COUNT || NORMAL_ITEMS_COUNT) * ITEM_TIMEOUT_MS;
if (timeout < 3000) timeout = 3000;
if (typeof jasmine !== 'undefined') jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;

console.log('Test info: items:', ITEMS_COUNT, 'timeout:', timeout);

import {forTimes} from 'dyna-loops';

import {DynaProcessManager, DynaProcess} from '../../src';
import {IError}                          from "../../src/interfaces";

const pm: DynaProcessManager = new DynaProcessManager({
  loggerSettings: {
    consoleLogs: false,
    consoleErrorLogs: false,
  },
});

describe('Dyna process manager - simple test with success termination', () => {
  let myProcesses: DynaProcess[] = [];

  it('should create the process', () => {
    forTimes(ITEMS_COUNT, () => {
      let myProcess = pm.addProcess({
        name: 'process test 1',
        command: 'node',
        args: 'ProcessSampleExit.js ProcessTest1 0 2000'.split(' '),
        cwd: './tests/scripts',
      });
      myProcesses.push(myProcess);
      expect(myProcess).not.toBe(undefined);
    });
  });

  it('should start myProcess', (done: Function) => {
    let started: number = 0;
    myProcesses.forEach((myProcess: DynaProcess) => {
      myProcess.start()
        .then((isStarted: boolean) => {
          expect(isStarted).toBe(true);
          expect(myProcess.active).toBe(true);
          started++;
          if (started === ITEMS_COUNT) done();
        })
        .catch((error: IError) => {
          expect(error).toBe(null);
          done();
        });
    });
  });

  it('should have active processes', () => {
    expect(pm.count).toBe(ITEMS_COUNT);
  });

  it('processes should still work', (done: Function) => {
    setTimeout(() => {
      myProcesses.forEach((myProcess: DynaProcess) => {
        expect(myProcess.active).toBe(true);
      });
      done();
    }, 1000);
    //}, 500 + (ITEMS_COUNT * 5));
  });

  it('my processed should not work anymore', (done: Function) => {
    setTimeout(() => {
      myProcesses.forEach((myProcess: DynaProcess) => {
        expect(myProcess.active).toBe(false);
      });
      done();
    }, timeout * 0.9);
  });

  it('should have active processes', () => {
    expect(pm.count).toBe(ITEMS_COUNT);
  });

  it('should remove them all', () => {
    myProcesses.forEach((myProcess: DynaProcess) => {
      pm.removeProcess(myProcess.id);
      expect(myProcess.active).toBe(false);
    });
    expect(pm.count).toBe(0);
  });

});

