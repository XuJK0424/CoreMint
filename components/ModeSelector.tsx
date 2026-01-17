import React from 'react';
import { AppMode } from '../types';
import { MODES } from '../constants';

interface ModeSelectorProps {
  currentMode: AppMode;
  onChange: (mode: AppMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onChange }) => {
  return (
    <div className="flex gap-2 p-1 bg-zinc-100/50 rounded-xl border border-zinc-200/50">
      {Object.values(MODES).map((mode) => {
        const isActive = currentMode === mode.id;
        
        let activeClass = '';
        if (isActive) {
           switch(mode.id) {
               case AppMode.COACH: activeClass = 'bg-white text-red-600 shadow-sm border-zinc-200'; break;
               case AppMode.ENCOURAGE: activeClass = 'bg-white text-emerald-600 shadow-sm border-zinc-200'; break;
               case AppMode.TOXIC: activeClass = 'bg-slate-900 text-white shadow-md border-slate-900'; break;
           }
        } else {
            activeClass = 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border-transparent';
        }

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`
              relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
              flex items-center gap-1.5
              ${activeClass}
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current' : mode.color}`}></span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;