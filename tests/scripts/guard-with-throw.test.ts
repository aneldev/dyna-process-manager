import "jest"
jasmine.DEFAULT_TIMEOUT_INTERVAL = 8000;

import {DynaProcessManager, EDynaProcessEvent, DynaProcess} from '../../src';
import {IError}                                             from "../../src/interfaces";

describe('Dyna process manager - should restart the failed process and stop it on demand', () => {
  const pm: DynaProcessManager = new DynaProcessManager();
  let myProcess: DynaProcess;
  const timeout: number = 2000;
  let stopped: boolean = false;
  let crashed: boolean = false;

  afterAll(async (done) => {
    await pm.stopAll();
    done();
  });

  it('should create the process', () => {
    myProcess = pm.addProcess({
      name: 'process test',
      command: 'node',
      args: `ProcessSampleThrow.js ProcessTestForCrash ${timeout}`.split(' '),
      cwd: './tests/scripts',
      guard: {
        restartAfterMs: timeout,
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
    }, timeout * 0.5);
  });

  it('myProcess should be crashed and not be active, is not yet restarted by the guard', (done: Function) => {
    setTimeout(() => {
      expect(myProcess.active).toBe(false);
      expect(stopped).toBe(false);
      expect(crashed).toBe(true);
      done();
    }, timeout * 1);
  });

  it('myProcess should still work again since is restarted by the guard', (done: Function) => {
    setTimeout(() => {
      expect(myProcess.active).toBe(true);
      expect(stopped).toBe(false);
      expect(crashed).toBe(true);
      done();
    }, timeout * 1);
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
