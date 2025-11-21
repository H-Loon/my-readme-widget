import { useState, useRef } from 'react';

export function useWidgetState() {
  const [widgetName, setWidgetName] = useState('Untitled Widget');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedWidgets, setSavedWidgets] = useState<any[]>([]);
  const ignoreNextUpdate = useRef(false);

  return {
    widgetName,
    setWidgetName,
    savedId,
    setSavedId,
    savedWidgets,
    setSavedWidgets,
    ignoreNextUpdate
  };
}
