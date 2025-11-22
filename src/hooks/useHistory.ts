/**
 * useHistory.ts
 * 
 * This custom hook implements Undo/Redo functionality for the canvas.
 * It keeps track of past states of the elements array so users can revert changes.
 * 
 * Note: This hook is also present in `src/controllers/useHistory.ts`.
 * The application currently imports from `controllers`, so this file might be redundant.
 */
import { useState, useEffect } from 'react';
import { CanvasElement } from '@/models/types';

export function useHistory(initialElements: CanvasElement[]) {
  // The current state of elements on the canvas.
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  
  // The history stack: an array of arrays, where each inner array is a snapshot of the elements.
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements]);
  
  // The current position in the history stack (index).
  const [historyStep, setHistoryStep] = useState(0);

  /**
   * Updates the elements and optionally saves the new state to history.
   * 
   * @param newElements - The new list of elements.
   * @param saveHistory - Whether to record this change in the undo stack (default: true).
   */
  const handleElementsChange = (newElements: CanvasElement[], saveHistory = true) => {
    setElements(newElements);
    if (saveHistory) {
      // If we are in the middle of the history (after undoing), discard the "future" states.
      const newHistory = history.slice(0, historyStep + 1);
      
      // Add the new state to the history.
      newHistory.push(newElements);
      
      // Update the history stack and move the pointer to the end.
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  /**
   * Reverts to the previous state in the history stack.
   */
  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setElements(history[prevStep]);
      setHistoryStep(prevStep);
    }
  };

  /**
   * Moves forward to the next state in the history stack (if available).
   */
  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setElements(history[nextStep]);
      setHistoryStep(nextStep);
    }
  };

  /**
   * Resets the history completely (e.g., when loading a new widget).
   * 
   * @param newElements - The initial state for the new history.
   */
  const resetHistory = (newElements: CanvasElement[]) => {
    setHistory([newElements]);
    setHistoryStep(0);
    setElements(newElements);
  };

  // Effect to handle keyboard shortcuts (Ctrl+Z for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't trigger undo/redo if the user is typing in an input field.
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for Ctrl+Z (or Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo(); // Ctrl+Shift+Z
        } else {
          undo(); // Ctrl+Z
        }
      }
      
      // Check for Ctrl+Y (Windows standard for Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyStep]);

  return {
    elements,
    setElements,
    history,
    historyStep,
    handleElementsChange,
    undo,
    redo,
    resetHistory
  };
}
