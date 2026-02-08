
export enum TimerPhase {
  IDLE = 'IDLE',
  PREPARE = 'PREPARE',
  WORK = 'WORK',
  REST = 'REST',
  COMPLETE = 'COMPLETE'
}

export interface TimerConfig {
  workDuration: number;
  restDuration: number;
  totalSets: number;
  prepareDuration: number;
}

export interface TimerState {
  phase: TimerPhase;
  currentSet: number;
  timeLeft: number;
  isActive: boolean;
}
