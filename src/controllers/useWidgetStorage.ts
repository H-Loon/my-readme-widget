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
  savedId,
  setSavedId,
  savedWidgets,
  setSavedWidgets,
  ignoreNextUpdate,
  resetHistory
}: UseWidgetStorageProps) {

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

  const saveWidget = async () => {
    if (!user) return alert("Please log in to save.");
    try {
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
        bgFit
      };

      const newId = await WidgetModel.save(savedId, widgetData);

      if (savedId && !savedId.startsWith('temp_')) {
        setSavedWidgets(prev => prev.map(w => w.id === savedId ? { ...w, ...widgetData, dirty: false } : w));
        alert("Widget updated!");
      } else {
        // If we were working on a temp widget, replace it in the list
        if (savedId && savedId.startsWith('temp_')) {
          setSavedWidgets(prev => prev.map(w => w.id === savedId ? { ...w, ...widgetData, id: newId, dirty: false } : w));
        } else {
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

  const loadWidget = (widget: any) => {
    ignoreNextUpdate.current = true;
    resetHistory(widget.elements || []);
    setCanvasWidth(widget.width || 1400);
    setCanvasHeight(widget.height || 600);
    setTheme(widget.theme || 'blue');
    setStyle(widget.style || 'ethereal');
    setBlobCount(widget.blobCount || 5);
    setCustomFrom(widget.customFrom || '#6366f1');
    setCustomTo(widget.customTo || '#ec4899');
    setBgImage(widget.bgImage || '');
    setBgFit(widget.bgFit || 'cover');
    setWidgetName(widget.name || 'Untitled Widget');
    setSavedId(widget.id);
  };

  const createNew = () => {
    const tempId = `temp_${Date.now()}`;
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
      createdAt: { seconds: Date.now() / 1000 },
      dirty: true
    };

    setSavedWidgets(prev => [newWidget, ...prev]);
    loadWidget(newWidget);
  };

  const deleteWidget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isTemp = id.startsWith('temp_');
    
    if (!confirm(isTemp ? "Discard this unsaved widget?" : "Are you sure you want to delete this widget?")) return;
    
    if (isTemp) {
      const remaining = savedWidgets.filter(w => w.id !== id);
      setSavedWidgets(remaining);
      
      if (savedId === id) {
        if (remaining.length > 0) {
          loadWidget(remaining[0]);
        } else {
          createNew();
        }
      }
      return;
    }

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
