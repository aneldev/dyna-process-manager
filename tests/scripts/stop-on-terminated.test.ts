import "jest"
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

import {DynaProcessManager, DynaProcess} from '../../src';
import {IError} from "../../src/interfaces";

const pm: DynaProcessManager = new DynaProcessManager({
  loggerSettings: {
    consoleLogs: false,
    consoleErrorLogs: true,
  },
});

describe('Dyna process manager - call stop on stopped', () => {
  let myProcess: DynaProcess;
  it('should create the process', () => {
    myProcess = pm.addProcess({
      name: 'process test 1',
      command: 'node',
      args: 'ProcessSampleExit.js ProcessTest1 0 200'.split(' '),
      cwd: './tests/scripts',
    });
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

  it('should have processes', () => {
    expect(pm.count).toBe(1);
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
    }, 500)
  });

  it('myProcess should stop again', (done: Function) => {
    pm.stop(myProcess.id)
      .then(() => {
        expect(true).toBe(true);
        done();
      })
      .catch((error) => {
        console.error('cannot stop the process', error);
        expect(true).toBe(false);
        done();
      });
  });

  it('should have processes', () => {
    expect(pm.count).toBe(1);
  });

  it('should remove the processes', () => {
    pm.removeProcess(myProcess.id);
    expect(pm.count).toBe(0);
  });
});
