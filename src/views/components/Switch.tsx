import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (c: boolean) => void;
}

export const Switch = ({ checked, onChange }: SwitchProps) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-9 h-5 rounded-full relative transition-colors border ${checked ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-700'}`}
  >
    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-4' : 'left-0.5'}`} />
  </button>
);
