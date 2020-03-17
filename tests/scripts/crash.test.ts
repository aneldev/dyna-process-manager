import "jest";
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

const STRESS_TEST: boolean = false;
const ITEM_TIMEOUT_MS: number = 40;
const NORMAL_ITEMS_COUNT: number = 2;
const STRESS_ITEMS_COUNT: number = 200;

const ITEMS_COUNT: number = STRESS_TEST && STRESS_ITEMS_COUNT || NORMAL_ITEMS_COUNT;
let timeout = (STRESS_TEST && STRESS_ITEMS_COUNT || NORMAL_ITEMS_COUNT) * ITEM_TIMEOUT_MS;
if (timeout < 3000) timeout = 3000;

console.log('Test info: items:', ITEMS_COUNT, 'timeout:', timeout);

import {DynaProcessManager, DynaProcess} from '../../src';
import {IError} from "../../src/interfaces";

const pm: DynaProcessManager = new DynaProcessManager({
  loggerSettings: {
    consoleLogs: false,
    consoleErrorLogs: false,
  },
});

describe('Dyna process manager - simple test with success termination', () => {
  let myProcesses: DynaProcess[] = [];

  it('should create the processes', () => {
    Array(ITEMS_COUNT).fill(null).forEach(() => {
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

  it('should start myProcesses', (done: Function) => {
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
          fail(error);
          if (started === ITEMS_COUNT) done();
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
    }, 500 + (ITEMS_COUNT * 5));
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

