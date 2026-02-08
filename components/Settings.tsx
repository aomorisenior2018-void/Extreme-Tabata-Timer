
import React, { useRef, useEffect } from 'react';
import { TimerConfig } from '../types';

interface SettingsProps {
  config: TimerConfig;
  onChange: (newConfig: TimerConfig) => void;
  disabled: boolean;
}

const SwipeSelector: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  colorClass: string;
}> = ({ min, max, value, onChange, unit = "", colorClass }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const itemWidth = 80; // 幅を広げて視認性を確保

  useEffect(() => {
    if (scrollRef.current) {
      const targetScroll = (value - min) * itemWidth;
      scrollRef.current.scrollLeft = targetScroll;
    }
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const index = Math.round(scrollLeft / itemWidth);
      const newValue = items[index];
      
      if (newValue !== undefined && newValue !== value) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className="relative w-full h-20 flex items-center bg-slate-900/60 rounded-3xl border border-slate-700/40 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
      {/* Center Highlight Frame */}
      <div className={`absolute left-1/2 -translate-x-1/2 w-[76px] h-16 border-2 rounded-2xl pointer-events-none z-10 transition-all duration-300 ${colorClass.replace('text', 'border')}/80 bg-white/5 shadow-[0_0_20px_rgba(0,0,0,0.4)]`}></div>
      
      {/* Indicator Dot */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-1.5 h-1.5 rounded-full bg-white z-20 pointer-events-none opacity-80"></div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full items-center overflow-x-auto snap-x snap-mandatory scrollbar-none px-[calc(50%-40px)]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((num) => (
          <div 
            key={num} 
            className={`flex-none w-[80px] h-full flex flex-col items-center justify-center snap-center transition-all duration-300 ${num === value ? 'scale-110' : 'scale-75 opacity-20'}`}
          >
            <span className={`text-3xl font-black tabular-nums ${num === value ? colorClass : 'text-slate-400'}`}>
              {num}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${num === value ? 'text-white' : 'text-slate-600'}`}>
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ config, onChange, disabled }) => {
  return (
    <div className={`w-full max-w-sm mx-auto transition-all duration-700 ${disabled ? 'opacity-5 pointer-events-none scale-90 blur-xl' : 'opacity-100'}`}>
      <div className="bg-slate-800/20 p-5 rounded-[3rem] border border-slate-700/30 backdrop-blur-xl flex flex-col space-y-5 shadow-2xl">
        
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 px-3">
            <i className="fa-solid fa-fire text-xs text-red-500"></i>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workout Interval</label>
          </div>
          <SwipeSelector 
            min={1} max={60} value={config.workDuration} 
            unit="sec" colorClass="text-red-500"
            onChange={(v) => onChange({...config, workDuration: v})} 
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 px-3">
            <i className="fa-solid fa-couch text-xs text-emerald-400"></i>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rest Interval</label>
          </div>
          <SwipeSelector 
            min={0} max={60} value={config.restDuration} 
            unit="sec" colorClass="text-emerald-400"
            onChange={(v) => onChange({...config, restDuration: v})} 
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 px-3">
            <i className="fa-solid fa-layer-group text-xs text-blue-400"></i>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Rounds</label>
          </div>
          <SwipeSelector 
            min={1} max={30} value={config.totalSets} 
            unit="sets" colorClass="text-blue-400"
            onChange={(v) => onChange({...config, totalSets: v})} 
          />
        </div>

      </div>
    </div>
  );
};

export default Settings;
