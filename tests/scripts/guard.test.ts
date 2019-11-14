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

describe('Dyna process manager - should restart the failed process and stop it on demand', () => {
  let myProcess: DynaProcess;
  let crashTimeout: number = 1000;
  let stopped: boolean = false;
  let crashed: boolean = false;

  it('should create the process', () => {
    myProcess = pm.addProcess({
      name: 'process test',
      command: 'node',
      args: `ProcessSampleThrow.js ProcessTestForCrash ${crashTimeout}`.split(' '),
      cwd: './tests/scripts',
      guard: {
        restartAfterMs: 50,
      },
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
    }, crashTimeout * 0.5);
  });


  it('myProcess should still work because is restarted by the guard', (done: Function) => {
    setTimeout(() => {
      expect(myProcess.active).toBe(true);
      expect(stopped).toBe(false);
      expect(crashed).toBe(true);
      done();
    }, crashTimeout * 1);
  });

  it('should stop the process', (done: Function) => {
    pm.stop(myProcess.id)
      .then(() => {
        done();
      })
      .catch((error: IError) => {
        console.error(error);
        done();
      });
  });

  it('should have processes', () => {
    expect(pm.count).toBe(1);
  });

  it('should remove the processes', (done: () => void) => {
    pm.removeProcess(myProcess.id)
      .then(() => {
        expect(pm.count).toBe(0);
        done();
      })
      .catch((error) => {
        throw(error);
      });
  });
});
