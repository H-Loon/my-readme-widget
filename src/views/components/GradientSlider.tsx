import React, { useRef } from 'react';
import { GradientStop } from '@/models/types';

interface GradientSliderProps {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}

export const GradientSlider = ({ stops, onChange }: GradientSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    const move = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let offset = (moveEvent.clientX - rect.left) / rect.width;
      offset = Math.max(0, Math.min(1, offset));
      const newStops = [...stops];
      newStops[index] = { ...newStops[index], offset };
      onChange(newStops.sort((a, b) => a.offset - b.offset));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div ref={containerRef} className="h-4 bg-slate-900 border border-slate-800 rounded-md relative cursor-pointer">
      <div
        className="absolute inset-0 rounded-md opacity-80"
        style={{
          background: `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
        }}
      />
      {stops.map((stop, i) => (
        <div
          key={i}
          onMouseDown={(e) => handleMouseDown(e, i)}
          className="absolute -top-1 w-6 h-6 -ml-3 bg-white border-2 border-slate-900 rounded-full cursor-ew-resize hover:scale-110 transition-transform shadow-lg z-10"
          style={{ left: `${stop.offset * 100}%` }}
        />
      ))}
    </div>
  );
};
