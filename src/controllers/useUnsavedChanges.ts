/**
 * useUnsavedChanges.ts
 * 
 * This hook prevents the user from accidentally closing the tab if they have unsaved work.
 * It listens for the browser's "beforeunload" event.
 */
import { useEffect } from 'react';

export function useUnsavedChanges(savedWidgets: any[]) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if any widget in the list is marked as "dirty" (modified) or is a temporary (unsaved) widget.
      const hasUnsaved = savedWidgets.some((w: any) => w.dirty || w.id.startsWith('temp_'));
      
      if (hasUnsaved) {
        // Standard way to trigger the browser's "Are you sure?" dialog.
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    // Add the event listener when the component mounts or savedWidgets changes.
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup the listener when the component unmounts.
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [savedWidgets]);
}
