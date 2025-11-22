/**
 * useWidgetState.ts
 * 
 * This hook manages the meta-data of the widget being edited.
 * It tracks the widget's name, its saved ID in the database, and the list of other saved widgets.
 */
import { useState, useRef } from 'react';

export function useWidgetState() {
  // The name of the current widget.
  const [widgetName, setWidgetName] = useState('Untitled Widget');
  
  // The database ID of the current widget (null if it's a new, unsaved widget).
  const [savedId, setSavedId] = useState<string | null>(null);
  
  // The list of all widgets saved by the user (for the sidebar list).
  const [savedWidgets, setSavedWidgets] = useState<any[]>([]);
  
  // A ref to prevent infinite loops or double-updates in certain effects.
  // If true, the next update will be ignored.
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
