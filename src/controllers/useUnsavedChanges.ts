import { useEffect } from 'react';

export function useUnsavedChanges(savedWidgets: any[]) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = savedWidgets.some((w: any) => w.dirty || w.id.startsWith('temp_'));
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [savedWidgets]);
}
