import "jest"
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

import {DynaProcessManager, EDynaProcessEvent, DynaProcess} from '../../src';
import {IError}                                             from "../../src/interfaces";

const pm: DynaProcessManager = new DynaProcessManager({
  loggerSettings: {
    consoleLogs: false,
    consoleErrorLogs: false,
  },
});

describe('Dyna process manager - simple test with throwing exception', () => {
  let myProcess: DynaProcess;
  let stopped: boolean = false;
  let crashed: boolean = false;

  it('should create the process', () => {
    myProcess = pm.addProcess({
      name: 'process test for crash',
      command: 'node',
      args: 'ProcessSampleThrow.js ProcessTestForCrash 200'.split(' '),
      cwd: './tests/scripts',
    });
    myProcess.on(EDynaProcessEvent.STOP, () => stopped = true);
    myProcess.on(EDynaProcessEvent.CRASH, () => crashed = true);
    expect(myProcess).not.toBe(undefined);
  });

  it('should start myProcess', (done: Function) => {
    myProcess.start()
      .then(() => {
        expect(myProcess.active).toBe(true);
        done();
      })
      .catch((error: IError) => {
        console.error(error);
        done();
      });
  });

  it('myProcess should still work', (done: Function) => {
    setTimeout(() => {
      expect(myProcess.active).toBe(true);
      done();
    }, 50);
  });

  it('myProcess should not work anymore', (done: Function) => {
    setTimeout(() => {
      expect(myProcess.active).toBe(false);
      done();
    }, 500);
  });

  it('should be crashed', (done: Function) => {
    setTimeout(() => {
      expect(stopped).toBe(false);
      expect(crashed).toBe(true);
      done();
    }, 500);
  });

  it('should have processes', () => {
    expect(pm.count).toBe(1);
  });

  it('should remove the processes', () => {
    pm.removeProcess(myProcess.id);
    expect(pm.count).toBe(0);
  });
});

