import { useState, useEffect } from 'react';
import { CanvasElement } from '@/models/types';

export function useHistory(initialElements: CanvasElement[]) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = useState(0);

  const handleElementsChange = (newElements: CanvasElement[], saveHistory = true) => {
    setElements(newElements);
    if (saveHistory) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setElements(history[prevStep]);
      setHistoryStep(prevStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setElements(history[nextStep]);
      setHistoryStep(nextStep);
    }
  };

  const resetHistory = (newElements: CanvasElement[]) => {
    setHistory([newElements]);
    setHistoryStep(0);
    setElements(newElements);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
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
