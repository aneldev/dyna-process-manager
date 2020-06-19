import "jest";
import { count } from "dyna-count";

const PROCESSES_COUNT: number = 1;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

console.log('Test info: items:', PROCESSES_COUNT, 'timeout:', jasmine.DEFAULT_TIMEOUT_INTERVAL);

import { DynaProcessManager, DynaProcess } from '../../src';
import { IError } from "../../src/interfaces";


describe('Dyna process manager - simple test with success termination', () => {
  let pm: DynaProcessManager
  let myProcesses: DynaProcess[] = [];

  beforeAll(() => {
    pm = new DynaProcessManager({
      loggerSettings: {
        consoleLogs: false,
        consoleErrorLogs: false,
      },
    });
  });

  afterAll(async (done) => {
    await pm.stopAll()
    done();
  });

  it(`should create ${PROCESSES_COUNT} the processes`, () => {
    count(PROCESSES_COUNT)
      .for(() => {
        let myProcess = pm.addProcess({
          name: 'process test 1',
          command: 'node',
          args: 'ProcessSampleExit.js ProcessTest1 1 2000'.split(' '),
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
          if (started === PROCESSES_COUNT) done();
        })
        .catch((error: IError) => {
          expect(error).toBe(null);
          done();
        });
    });
  });

  it('should have processes', () => {
    expect(pm.count).toBe(PROCESSES_COUNT);
  });

  it('processes should still work', (done: Function) => {
    setTimeout(() => {
      myProcesses.forEach((myProcess: DynaProcess) => {
        expect(myProcess.active).toBe(true);
      });
      done();
    }, 1000);
  });

  it('my processed should not work anymore', (done: Function) => {
    setTimeout(() => {
      myProcesses.forEach((myProcess: DynaProcess) => {
        expect(myProcess.active).toBe(false);
      });
      done();
    }, jasmine.DEFAULT_TIMEOUT_INTERVAL * 0.9);
  });

  it('should have processes', () => {
    expect(pm.count).toBe(PROCESSES_COUNT);
  });

  it('should remove them all', () => {
    myProcesses.forEach((myProcess: DynaProcess) => {
      pm.removeProcess(myProcess.id);
      expect(myProcess.active).toBe(false);
    });
    expect(pm.count).toBe(0);
  });

});

