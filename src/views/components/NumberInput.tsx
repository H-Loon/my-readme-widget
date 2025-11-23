/**
 * NumberInput.tsx
 * 
 * A custom number input component with increment/decrement buttons.
 * Used for setting numeric values like width, height, font size, etc.
 */
import React, { useRef } from 'react';
import { Icons } from './Icons';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: number) => void;
}

export function NumberInput({ className, value, onChange, min, max, step = 1, ...props }: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIncrement = () => {
    const currentValue = Number(value || 0);
    const newValue = currentValue + Number(step);
    if (max !== undefined && newValue > Number(max)) return;
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = Number(value || 0);
    const newValue = currentValue - Number(step);
    if (min !== undefined && newValue < Number(min)) return;
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);

    // Fix for leading zeros (e.g. "025" -> "25")
    if (/^0[0-9]/.test(e.target.value)) {
      e.target.value = String(newValue);
    }
  };

  // Prevent scroll from changing value and allow page scroll
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className="relative group">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleChange}
        onWheel={handleWheel}
        min={min}
        max={max}
        step={step}
        className={`pr-6 appearance-none ${className}`} // pr-6 for space for buttons
        {...props}
      />
      <div className="absolute right-[1px] top-[1px] bottom-[1px] w-5 flex flex-col border-l border-slate-800">
        <button
          onClick={handleIncrement}
          className="flex-1 flex items-center justify-center hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors rounded-tr-md"
          tabIndex={-1}
          aria-label="Increment"
        >
          <Icons.ChevronUp size={10} />
        </button>
        <button
          onClick={handleDecrement}
          className="flex-1 flex items-center justify-center hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors border-t border-slate-800 rounded-br-md"
          tabIndex={-1}
          aria-label="Decrement"
        >
          <Icons.ChevronDown size={10} />
        </button>
      </div>
    </div>
  );
}
