/**
 * GradientSlider.tsx
 * 
 * A complex custom slider for editing gradient stops.
 * Allows users to add, remove, and move color stops along a gradient bar.
 */
import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icons';

interface GradientStop {
    offset: number; // Position from 0 to 100%
    color: string;  // Color value (hex, rgb, etc.)
}

interface GradientSliderProps {
    stops: GradientStop[];          // Array of gradient stops
    onChange: (stops: GradientStop[]) => void; // Callback when stops change
    className?: string;             // Optional extra CSS classes
}

export const GradientSlider: React.FC<GradientSliderProps> = ({ stops, onChange, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Sort stops by offset to ensure correct rendering order
    const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

    // Handle mouse down on a stop handle to start dragging
    const handleMouseDown = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveStopIndex(index);
        setIsDragging(true);
    };

    // Handle mouse move to update stop position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || activeStopIndex === null || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            // Calculate percentage position (0-100)
            let percentage = (x / rect.width) * 100;
            
            // Clamp between 0 and 100
            percentage = Math.max(0, Math.min(100, percentage));

            // Update the stops array
            const newStops = [...stops];
            newStops[activeStopIndex] = {
                ...newStops[activeStopIndex],
                offset: Math.round(percentage)
            };
            
            onChange(newStops);
        };

        // Stop dragging on mouse up
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, activeStopIndex, stops, onChange]);

    // Add a new stop when clicking on the empty track area
    const handleTrackClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        // Create new stop with a default color (white)
        const newStop: GradientStop = {
            offset: Math.round(percentage),
            color: '#ffffff'
        };
        
        onChange([...stops, newStop]);
    };

    // Remove the currently selected stop
    const removeStop = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        // Prevent removing the last two stops (gradient needs at least 2)
        if (stops.length <= 2) return;
        
        const newStops = stops.filter((_, i) => i !== index);
        onChange(newStops);
        setActiveStopIndex(null);
    };

    // Update color of the selected stop
    const handleColorChange = (index: number, color: string) => {
        const newStops = [...stops];
        newStops[index] = { ...newStops[index], color };
        onChange(newStops);
    };

    // Generate CSS gradient string for the preview background
    const gradientString = `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.offset}%`).join(', ')})`;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="h-6 relative select-none" ref={containerRef} onClick={handleTrackClick}>
                {/* Checkerboard background for transparency */}
                <div className="absolute inset-0 rounded-md overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABtJREFUKFNj/P///38GKgImDqaXgU5Gg6X5aCgA6v0P6x5nLvoAAAAASUVORK5CYII=')] opacity-20" />
                
                {/* The actual gradient preview */}
                <div 
                    className="absolute inset-0 rounded-md border border-gray-200 dark:border-gray-700"
                    style={{ background: gradientString }}
                />

                {/* Render handles for each stop */}
                {stops.map((stop, index) => (
                    <div
                        key={index}
                        className="absolute top-0 bottom-0 w-4 -ml-2 cursor-ew-resize group z-10"
                        style={{ left: `${stop.offset}%` }}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                    >
                        {/* The handle visual (white circle with border) */}
                        <div className={`
                            w-4 h-full bg-white border-2 rounded shadow-sm
                            ${activeStopIndex === index ? 'border-blue-500 z-20' : 'border-gray-300 hover:border-gray-400'}
                        `}>
                            {/* Color preview inside the handle */}
                            <div 
                                className="w-full h-full rounded-sm"
                                style={{ backgroundColor: stop.color }}
                            />
                        </div>
                        
                        {/* Delete button that appears on hover (if more than 2 stops) */}
                        {stops.length > 2 && (
                            <button
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                                onClick={(e) => removeStop(index, e)}
                                title="Remove stop"
                            >
                                <Icons.Plus size={10} className="rotate-45" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Color picker for the active stop */}
            {activeStopIndex !== null && stops[activeStopIndex] && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500">Color:</span>
                    <input
                        type="color"
                        value={stops[activeStopIndex].color}
                        onChange={(e) => handleColorChange(activeStopIndex, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-none p-0"
                    />
                    <input
                        type="text"
                        value={stops[activeStopIndex].color}
                        onChange={(e) => handleColorChange(activeStopIndex, e.target.value)}
                        className="flex-1 text-xs bg-transparent border-none focus:ring-0 font-mono"
                    />
                    <span className="text-xs text-gray-500">
                        {stops[activeStopIndex].offset}%
                    </span>
                </div>
            )}
        </div>
    );
};
