import {ELogType} from "dyna-logger";

export interface IDynaProcessGuard {
  intervalChecks?: IGuardIntervalCheck[];
  onConsole?: (consoleType: ELogType, restart: () => void, stop: () => void) => void;
  onCrash?: {
    restartAfterMs: number;
  };
}

export interface IGuardIntervalCheck {
  interval: number;
  check: (restart: () => void, stop: () => void) => void;
}
