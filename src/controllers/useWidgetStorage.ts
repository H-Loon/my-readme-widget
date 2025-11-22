/**
 * useWidgetStorage.ts
 * 
 * This hook handles the persistence layer of the application.
 * It connects the UI state (elements, settings) with the Backend (Firebase).
 * It provides functions to:
 * - Fetch saved widgets.
 * - Save the current widget.
 * - Load a widget into the editor.
 * - Delete a widget.
 * - Create a new blank widget.
 */
import { MutableRefObject } from 'react';
import { WidgetModel } from '@/models/WidgetModel';
import { CanvasElement, WidgetData } from '@/models/types';

interface UseWidgetStorageProps {
  user: any;
  widgetName: string;
  setWidgetName: (name: string) => void;
  elements: CanvasElement[];
  setElements: (elements: CanvasElement[]) => void;
  canvasWidth: number;
  setCanvasWidth: (w: number) => void;
  canvasHeight: number;
  setCanvasHeight: (h: number) => void;
  theme: string;
  setTheme: (t: string) => void;
  style: string;
  setStyle: (s: string) => void;
  blobCount: number;
  setBlobCount: (b: number) => void;
  customFrom: string;
  setCustomFrom: (c: string) => void;
  customTo: string;
  setCustomTo: (c: string) => void;
  bgImage: string;
  setBgImage: (i: string) => void;
  bgFit: 'cover' | 'contain';
  setBgFit: (f: 'cover' | 'contain') => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  blobColor: string;
  setBlobColor: (c: string) => void;
  bgGradient: any;
  setBgGradient: (g: any) => void;
  savedId: string | null;
  setSavedId: (id: string | null) => void;
  savedWidgets: any[];
  setSavedWidgets: React.Dispatch<React.SetStateAction<any[]>>;
  ignoreNextUpdate: MutableRefObject<boolean>;
  resetHistory: (elements: CanvasElement[]) => void;
}

export function useWidgetStorage({
  user,
  widgetName,
  setWidgetName,
  elements,
  setElements,
  canvasWidth,
  setCanvasWidth,
  canvasHeight,
  setCanvasHeight,
  theme,
  setTheme,
  style,
  setStyle,
  blobCount,
  setBlobCount,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  bgImage,
  setBgImage,
  bgFit,
  setBgFit,
  bgColor,
  setBgColor,
  blobColor,
  setBlobColor,
  bgGradient,
  setBgGradient,
  savedId,
  setSavedId,
  savedWidgets,
  setSavedWidgets,
  ignoreNextUpdate,
  resetHistory
}: UseWidgetStorageProps) {

  /**
   * Fetches all widgets for the currently logged-in user.
   */
  const fetchWidgets = async (currentUser: any) => {
    if (!currentUser) {
      setSavedWidgets([]);
      return;
    }
    try {
      const widgets = await WidgetModel.fetchByUser(currentUser.uid);
      setSavedWidgets(widgets);
    } catch (e) {
      console.error("Error fetching widgets", e);
    }
  };

  /**
   * Saves the current state of the editor to the database.
   * If it's a new widget, it creates a new document.
   * If it's an existing widget, it updates it.
   */
  const saveWidget = async () => {
    if (!user) return alert("Please log in to save.");
    try {
      // Prepare the data object to be saved.
      const widgetData: WidgetData = {
        uid: user.uid,
        createdAt: new Date(),
        name: widgetName,
        elements,
        width: canvasWidth,
        height: canvasHeight,
        theme,
        style,
        blobCount,
        customFrom,
        customTo,
        bgImage,
        bgFit,
        bgColor,
        blobColor,
        bgGradient
      };

      // Save to Firestore via the Model.
      const newId = await WidgetModel.save(savedId, widgetData);

      // Update the local state to reflect the save.
      if (savedId && !savedId.startsWith('temp_')) {
        // Update existing widget in the list.
        setSavedWidgets(prev => prev.map(w => w.id === savedId ? { ...w, ...widgetData, dirty: false } : w));
        alert("Widget updated!");
      } else {
        // If we were working on a temp widget, replace it in the list with the real one.
        if (savedId && savedId.startsWith('temp_')) {
          setSavedWidgets(prev => prev.map(w => w.id === savedId ? { ...w, ...widgetData, id: newId, dirty: false } : w));
        } else {
          // Add new widget to the top of the list.
          setSavedWidgets(prev => [{ ...widgetData, id: newId, dirty: false }, ...prev]);
        }
        
        setSavedId(newId);
        alert("Saved! Short link generated.");
      }
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Error saving. Check console.");
    }
  };

  /**
   * Loads a widget's data into the editor state.
   * 
   * @param widget - The widget object to load.
   */
  const loadWidget = (widget: any) => {
    // Prevent the auto-save or other effects from triggering immediately.
    ignoreNextUpdate.current = true;
    
    // Reset history so we can't undo back into the previous widget.
    resetHistory(widget.elements || []);
    
    // Set all the state variables.
    setCanvasWidth(widget.width || 1400);
    setCanvasHeight(widget.height || 600);
    setTheme(widget.theme || 'blue');
    setStyle(widget.style || 'ethereal');
    setBlobCount(widget.blobCount || 5);
    setCustomFrom(widget.customFrom || '#6366f1');
    setCustomTo(widget.customTo || '#ec4899');
    setBgImage(widget.bgImage || '');
    setBgFit(widget.bgFit || 'cover');
    setBgColor(widget.bgColor || '#0f172a');
    setBlobColor(widget.blobColor || '#0f172a');
    setBgGradient(widget.bgGradient || { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] });
    setWidgetName(widget.name || 'Untitled Widget');
    setSavedId(widget.id);
  };

  /**
   * Creates a new, empty widget with default settings.
   */
  const createNew = () => {
    const tempId = `temp_${Date.now()}`;
    
    // Default elements to show on a new canvas.
    const defaultElements: CanvasElement[] = [
      { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
      { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
    ];

    const newWidget = {
      id: tempId,
      name: 'Untitled Widget',
      elements: defaultElements,
      width: 1400,
      height: 600,
      theme: 'transparent',
      style: 'transparent',
      blobCount: 5,
      customFrom: '#6366f1',
      customTo: '#ec4899',
      bgImage: '',
      bgFit: 'cover',
      bgColor: '#0f172a',
      blobColor: '#0f172a',
      bgGradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] },
      createdAt: { seconds: Date.now() / 1000 },
      dirty: true
    };

    // Add the temp widget to the list and load it.
    setSavedWidgets(prev => [newWidget, ...prev]);
    loadWidget(newWidget);
  };

  /**
   * Deletes a widget.
   * 
   * @param id - The ID of the widget to delete.
   * @param e - The mouse event (to stop propagation).
   */
  const deleteWidget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isTemp = id.startsWith('temp_');
    
    if (!confirm(isTemp ? "Discard this unsaved widget?" : "Are you sure you want to delete this widget?")) return;
    
    // If it's a temp widget, just remove it from the local list.
    if (isTemp) {
      const remaining = savedWidgets.filter(w => w.id !== id);
      setSavedWidgets(remaining);
      
      // If we deleted the currently open widget, load another one or create new.
      if (savedId === id) {
        if (remaining.length > 0) {
          loadWidget(remaining[0]);
        } else {
          createNew();
        }
      }
      return;
    }

    // If it's a real widget, delete from DB.
    try {
      await WidgetModel.delete(id);
      const remaining = savedWidgets.filter(w => w.id !== id);
      setSavedWidgets(remaining);
      
      if (savedId === id) {
        if (remaining.length > 0) {
          loadWidget(remaining[0]);
        } else {
          createNew();
        }
      }
    } catch (e) {
      console.error("Error deleting", e);
    }
  };

  return {
    fetchWidgets,
    saveWidget,
    loadWidget,
    createNew,
    deleteWidget
  };
}
