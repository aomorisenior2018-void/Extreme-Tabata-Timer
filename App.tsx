
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerPhase, TimerConfig, TimerState } from './types';
import { audioService } from './services/audioService';
import TimerDisplay from './components/TimerDisplay';
import Settings from './components/Settings';

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 20,
  restDuration: 10,
  totalSets: 8,
  prepareDuration: 5,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [state, setState] = useState<TimerState>({
    phase: TimerPhase.IDLE,
    currentSet: 1,
    timeLeft: DEFAULT_CONFIG.prepareDuration,
    isActive: false,
  });

  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.stopMusic();
    setState({
      phase: TimerPhase.IDLE,
      currentSet: 1,
      timeLeft: config.prepareDuration,
      isActive: false,
    });
  }, [config.prepareDuration]);

  const toggleTimer = async () => {
    await audioService.resume();
    const nextActive = !state.isActive;
    setState((prev) => ({ ...prev, isActive: nextActive }));
    
    if (isMusicOn) {
      if (nextActive && state.phase !== TimerPhase.IDLE && state.phase !== TimerPhase.COMPLETE) {
        audioService.startMusic(state.phase === TimerPhase.WORK ? 'fast' : 'slow');
      } else {
        audioService.stopMusic();
      }
    }
  };

  const handlePhaseComplete = useCallback(() => {
    setState((prev) => {
      let nextPhase = prev.phase;
      let nextSet = prev.currentSet;
      let nextTime = 0;

      if (prev.phase === TimerPhase.IDLE || prev.phase === TimerPhase.PREPARE) {
        nextPhase = TimerPhase.WORK;
        nextTime = config.workDuration;
        audioService.playBuzzer();
        if (isMusicOn) {
          audioService.stopMusic();
          audioService.startMusic('fast');
        }
      } else if (prev.phase === TimerPhase.WORK) {
        if (prev.currentSet >= config.totalSets) {
          nextPhase = TimerPhase.COMPLETE;
          nextTime = 0;
          audioService.playSuccess();
          audioService.stopMusic();
          return { ...prev, phase: nextPhase, timeLeft: nextTime, isActive: false };
        } else {
          nextPhase = TimerPhase.REST;
          nextTime = config.restDuration;
          audioService.playBuzzer();
          if (isMusicOn) {
            audioService.stopMusic();
            audioService.startMusic('slow');
          }
        }
      } else if (prev.phase === TimerPhase.REST) {
        nextPhase = TimerPhase.WORK;
        nextSet = prev.currentSet + 1;
        nextTime = config.workDuration;
        audioService.playBuzzer();
        if (isMusicOn) {
          audioService.stopMusic();
          audioService.startMusic('fast');
        }
      }

      return {
        ...prev,
        phase: nextPhase,
        currentSet: nextSet,
        timeLeft: nextTime,
      };
    });
  }, [config, isMusicOn]);

  useEffect(() => {
    if (state.isActive && state.phase !== TimerPhase.COMPLETE) {
      timerRef.current = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0 };
          }
          // 移行前の3秒カウントダウン (3, 2, 1)
          if (prev.timeLeft <= 4 && prev.timeLeft > 1) {
            audioService.playCountdownBeep(false);
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isActive, state.phase]);

  useEffect(() => {
    if (state.isActive && state.timeLeft === 0 && state.phase !== TimerPhase.COMPLETE) {
      handlePhaseComplete();
    }
  }, [state.timeLeft, state.isActive, state.phase, handlePhaseComplete]);

  useEffect(() => {
    if (state.phase === TimerPhase.IDLE) {
      setState(prev => ({ ...prev, timeLeft: config.prepareDuration }));
    }
  }, [config.prepareDuration, state.phase]);

  const startPrepare = async () => {
    await audioService.resume();
    setState({
      phase: TimerPhase.PREPARE,
      currentSet: 1,
      timeLeft: config.prepareDuration,
      isActive: true,
    });
    audioService.playCountdownBeep(false);
    if (isMusicOn) {
      audioService.startMusic('slow');
    }
  };

  const toggleMusic = async () => {
    await audioService.resume();
    const nextMusicState = !isMusicOn;
    setIsMusicOn(nextMusicState);
    if (nextMusicState) {
      if (state.isActive && state.phase !== TimerPhase.IDLE && state.phase !== TimerPhase.COMPLETE) {
        audioService.startMusic(state.phase === TimerPhase.WORK ? 'fast' : 'slow');
      }
    } else {
      audioService.stopMusic();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center p-3 sm:p-6 select-none overflow-y-auto overflow-x-hidden scrollbar-none">
      <div className="w-full max-w-sm flex flex-col flex-1 space-y-4">
        
        <header className="flex items-center justify-between pt-1 px-2">
          <h1 className="text-xl font-black tracking-tighter text-white italic">
            TABATA<span className="text-red-500">PRO</span>
          </h1>
          <button 
            onClick={toggleMusic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMusicOn ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-slate-500'}`}
          >
            <i className={`fa-solid ${isMusicOn ? 'fa-music' : 'fa-volume-xmark'}`}></i>
          </button>
        </header>

        <main className="flex-1 flex flex-col justify-center space-y-4">
          
          <section className="relative">
            <TimerDisplay
              timeLeft={state.timeLeft}
              phase={state.phase}
              currentSet={state.currentSet}
              totalSets={config.totalSets}
              isMusicOn={isMusicOn}
            />
          </section>

          <section className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={resetTimer}
                className="flex-none w-14 h-14 flex items-center justify-center bg-slate-800/40 text-slate-400 rounded-full border border-slate-700/30 active:scale-90"
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
              </button>

              {state.phase === TimerPhase.IDLE || state.phase === TimerPhase.COMPLETE ? (
                <button
                  onClick={startPrepare}
                  className="flex-1 h-14 bg-emerald-500 active:bg-emerald-400 text-slate-950 text-base font-black rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 uppercase tracking-wider"
                >
                  <i className="fa-solid fa-play"></i>
                  <span>START WORKOUT</span>
                </button>
              ) : (
                <button
                  onClick={toggleTimer}
                  className={`flex-1 h-14 ${state.isActive ? 'bg-amber-500' : 'bg-emerald-500'} text-slate-950 text-base font-black rounded-2xl shadow-lg active:scale-95 flex items-center justify-center space-x-2 uppercase tracking-wider`}
                >
                  <i className={`fa-solid ${state.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                  <span>{state.isActive ? 'PAUSE' : 'RESUME'}</span>
                </button>
              )}
            </div>

            <Settings 
              config={config} 
              onChange={setConfig} 
              disabled={state.isActive || (state.phase !== TimerPhase.IDLE && state.phase !== TimerPhase.COMPLETE)} 
            />
          </section>

        </main>

        <footer className="text-center text-[7px] font-bold text-slate-700 uppercase tracking-[0.4em] pb-2">
          Precision Interval Engine v2.5
        </footer>
      </div>
    </div>
  );
};

export default App;
