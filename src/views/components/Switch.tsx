/**
 * Switch.tsx
 * 
 * A reusable toggle switch component.
 * Used for boolean settings like "Show Border" or "Transparent Background".
 */
import React from 'react';

interface SwitchProps {
    checked: boolean;           // Current state (on/off)
    onChange: (checked: boolean) => void; // Callback when toggled
    label?: string;             // Optional text label to display next to the switch
    'aria-label'?: string;      // Accessibility label
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, 'aria-label': ariaLabel }) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
                {/* Hidden checkbox input that handles the state */}
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-label={ariaLabel || label}
                />
                
                {/* The track (background) of the switch */}
                <div className={`w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
                
                {/* The thumb (circle) that moves back and forth */}
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                    checked ? 'translate-x-4' : 'translate-x-0'
                }`} />
            </div>
            
            {/* Optional label text */}
            {label && (
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                    {label}
                </span>
            )}
        </label>
    );
};
