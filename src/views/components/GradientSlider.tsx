/**
 * GradientSlider.tsx
 * 
 * A complex custom slider for editing gradient stops.
 * Allows users to add, remove, and move color stops along a gradient bar.
 * 
 * Updates:
 * - Refactored handles to be circular with hover scaling effects.
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
            // Calculate offset (0-1)
            let offset = x / rect.width;
            
            // Clamp between 0 and 1
            offset = Math.max(0, Math.min(1, offset));

            // Update the stops array
            const newStops = [...stops];
            newStops[activeStopIndex] = {
                ...newStops[activeStopIndex],
                offset: Number(offset.toFixed(4)) // Keep 4 decimal places
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
        // If we were dragging, don't create a new stop
        // (Though usually click doesn't fire if mousedown was stopped, but just in case)
        if (isDragging) return;
        
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const offset = Math.max(0, Math.min(1, x / rect.width));
        
        // Create new stop with a default color (white)
        const newStop: GradientStop = {
            offset: Number(offset.toFixed(4)),
            color: '#ffffff'
        };
        
        onChange([...stops, newStop]);
        setActiveStopIndex(stops.length); // Select the new stop
    };

    // Remove the currently selected stop
    const removeStop = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent track click
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

    // Update offset manually
    const handleOffsetChange = (index: number, percentage: number) => {
        const newStops = [...stops];
        const offset = Math.max(0, Math.min(100, percentage)) / 100;
        newStops[index] = { ...newStops[index], offset };
        onChange(newStops);
    };

    // Generate CSS gradient string for the preview background
    const gradientString = `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="h-6 relative select-none cursor-pointer" ref={containerRef} onClick={handleTrackClick}>
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
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 -ml-3 cursor-ew-resize group z-10 flex items-center justify-center"
                        style={{ left: `${stop.offset * 100}%` }}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                        onClick={(e) => e.stopPropagation()} // Prevent track click
                    >
                        {/* The handle visual (white circle with border) */}
                        <div className={`
                            w-5 h-5 bg-white border-2 border-white rounded-full shadow-md transition-transform duration-200 hover:scale-125
                            ${activeStopIndex === index ? 'scale-110 ring-2 ring-blue-500/50' : ''}
                        `}>
                            {/* Color preview inside the handle */}
                            <div 
                                className="w-full h-full rounded-full border border-black/10"
                                style={{ backgroundColor: stop.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
