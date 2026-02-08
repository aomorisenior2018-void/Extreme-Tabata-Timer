
import React from 'react';
import { TimerPhase } from '../types';

interface TimerDisplayProps {
  timeLeft: number;
  phase: TimerPhase;
  currentSet: number;
  totalSets: number;
  isMusicOn: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, phase, currentSet, totalSets, isMusicOn }) => {
  const getPhaseStyles = () => {
    switch (phase) {
      case TimerPhase.WORK: 
        return { text: 'text-red-500', glow: 'shadow-[0_0_80px_-10px_rgba(239,68,68,0.7)]', bg: 'bg-red-500/5', border: 'border-red-500/40' };
      case TimerPhase.REST: 
        return { text: 'text-emerald-400', glow: 'shadow-[0_0_80px_-10px_rgba(52,211,153,0.6)]', bg: 'bg-emerald-500/5', border: 'border-emerald-500/40' };
      case TimerPhase.PREPARE: 
        return { text: 'text-yellow-400', glow: 'shadow-[0_0_80px_-10px_rgba(250,204,21,0.5)]', bg: 'bg-yellow-400/5', border: 'border-yellow-400/40' };
      case TimerPhase.COMPLETE: 
        return { text: 'text-blue-400', glow: 'shadow-[0_0_80px_-10px_rgba(59,130,246,0.5)]', bg: 'bg-blue-400/5', border: 'border-blue-400/40' };
      default: 
        return { text: 'text-slate-500', glow: '', bg: '', border: 'border-slate-800' };
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case TimerPhase.WORK: return 'G O !';
      case TimerPhase.REST: return 'R E S T';
      case TimerPhase.PREPARE: return 'G E T  R E A D Y';
      case TimerPhase.COMPLETE: return 'F I N I S H E D';
      default: return 'R E A D Y';
    }
  };

  const styles = getPhaseStyles();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative flex flex-col items-center justify-center py-8 px-4 sm:py-12 sm:px-6 space-y-1 transition-all duration-1000 rounded-[3rem] ${styles.bg} ${styles.glow} border-2 ${styles.border} backdrop-blur-md`}>
      
      {/* Beat Pulse Animation */}
      {isMusicOn && phase !== TimerPhase.IDLE && phase !== TimerPhase.COMPLETE && (
        <div className={`absolute inset-0 rounded-[3rem] animate-ping opacity-20 pointer-events-none border-[6px] ${styles.text}`} style={{ animationDuration: phase === TimerPhase.WORK ? '0.41s' : '0.66s' }}></div>
      )}

      <div className={`text-[11px] sm:text-xs font-black tracking-[0.8em] transition-colors duration-500 ${styles.text} uppercase mb-2 drop-shadow-lg`}>
        {getPhaseLabel()}
      </div>
      
      <div className={`timer-text text-[5rem] xs:text-[6.5rem] sm:text-[7.5rem] font-black leading-none transition-all duration-300 ${styles.text} drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] tracking-tight`}>
        {phase === TimerPhase.COMPLETE ? '00:00' : formatTime(timeLeft)}
      </div>

      <div className="flex flex-col items-center space-y-5 pt-6 w-full max-w-[200px]">
        <div className="flex items-center justify-between w-full text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">
          <span>PROGRESS</span>
          <span className="text-white italic text-xl">{currentSet} <span className="text-[10px] font-bold text-slate-500 not-italic">/ {totalSets}</span></span>
        </div>
        
        <div className="flex w-full gap-1.5 h-2 px-0.5">
          {Array.from({ length: totalSets }).map((_, i) => {
            const isActive = i + 1 === currentSet;
            const isCompleted = i + 1 < currentSet;
            return (
              <div 
                key={i} 
                className={`flex-1 transition-all duration-500 rounded-full ${
                  isActive ? `opacity-100 ${styles.text} bg-current shadow-[0_0_8px_currentColor]` : 
                  isCompleted ? 'bg-slate-400 opacity-30' : 
                  'bg-slate-800 opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
