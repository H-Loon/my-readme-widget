/**
 * Main Application Entry Point
 * 
 * This file serves as the root page for the application. It is responsible for:
 * 1. Initializing all global state hooks (Auth, Editor, Widget, History).
 * 2. Coordinating data flow between the state layer and the view layer.
 * 3. Handling initial data fetching and URL parameter parsing.
 * 
 * It renders the `HomeView` component, passing down all necessary state and handlers.
 */
'use client';
import React, { useState, useEffect } from 'react';
import { useHistory } from '@/controllers/useHistory';
import { useCanvasOperations } from '@/controllers/useCanvasOperations';
import { useWidgetStorage } from '@/controllers/useWidgetStorage';
import { useAuth } from '@/controllers/useAuth';
import { useEditorState } from '@/controllers/useEditorState';
import { useFonts } from '@/controllers/useFonts';
import { useUnsavedChanges } from '@/controllers/useUnsavedChanges';
import { useWidgetState } from '@/controllers/useWidgetState';
import { getApiUrl } from '@/utils/canvasHelpers';
import { HomeView } from '@/views/HomeView';

export default function Home() {
  // State Hooks
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');
  
  const editorState = useEditorState();
  const widgetState = useWidgetState();
  const fontState = useFonts();
  const { user, isAuthLoading, login, logout } = useAuth();

  // History Hook
  const {
    elements,
    setElements,
    history,
    historyStep,
    handleElementsChange,
    undo,
    redo,
    resetHistory
  } = useHistory([
    { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
    { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
  ]);

  // Canvas Operations Hook
  const {
    addText,
    addImage,
    updateSelected,
    deleteSelected,
    fitToWidth,
    fitToHeight,
    handleAlignChange,
    fitCanvasToContent
  } = useCanvasOperations({
    elements,
    handleElementsChange,
    selectedIds,
    setSelectedIds,
    canvasWidth: editorState.canvasWidth,
    canvasHeight: editorState.canvasHeight,
    setCanvasHeight: editorState.setCanvasHeight
  });

  // Widget Storage Hook
  const {
    fetchWidgets,
    saveWidget,
    loadWidget,
    createNew,
    deleteWidget
  } = useWidgetStorage({
    user,
    elements,
    setElements,
    resetHistory,
    ...widgetState,
    ...editorState
  });

  // Unsaved Changes Warning
  useUnsavedChanges(widgetState.savedWidgets);

  // Sync Effect
  useEffect(() => {
    if (!widgetState.savedId || widgetState.ignoreNextUpdate.current) {
      widgetState.ignoreNextUpdate.current = false;
      return;
    }

    widgetState.setSavedWidgets(prev => prev.map(w => {
      if (w.id === widgetState.savedId) {
        return {
          ...w,
          name: widgetState.widgetName,
          elements,
          width: editorState.canvasWidth,
          height: editorState.canvasHeight,
          theme: editorState.theme,
          style: editorState.style,
          blobCount: editorState.blobCount,
          customFrom: editorState.customFrom,
          customTo: editorState.customTo,
          bgImage: editorState.bgImage,
          bgFit: editorState.bgFit,
          dirty: true
        };
      }
      return w;
    }));
  }, [
    elements, 
    editorState.canvasWidth, 
    editorState.canvasHeight, 
    editorState.theme, 
    editorState.style, 
    editorState.blobCount, 
    editorState.customFrom, 
    editorState.customTo, 
    editorState.bgImage, 
    editorState.bgFit, 
    widgetState.widgetName, 
    widgetState.savedId
  ]);

  useEffect(() => {
    if (user) {
      fetchWidgets(user);
    }
  }, [user]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const getUrl = (forcePreview = false) => getApiUrl({
    savedId: widgetState.savedId,
    elements,
    canvasWidth: editorState.canvasWidth,
    canvasHeight: editorState.canvasHeight,
    theme: editorState.theme,
    style: editorState.style,
    blobCount: editorState.blobCount,
    customFrom: editorState.customFrom,
    customTo: editorState.customTo,
    bgImage: editorState.bgImage,
    bgFit: editorState.bgFit,
    origin,
    forcePreview
  });

  return (
    <HomeView
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
      editorState={editorState}
      widgetState={widgetState}
      fontState={fontState}
      user={user}
      login={login}
      logout={logout}
      elements={elements}
      history={history}
      historyStep={historyStep}
      handleElementsChange={handleElementsChange}
      undo={undo}
      redo={redo}
      addText={addText}
      addImage={addImage}
      updateSelected={updateSelected}
      deleteSelected={deleteSelected}
      fitToWidth={fitToWidth}
      fitToHeight={fitToHeight}
      handleAlignChange={handleAlignChange}
      fitCanvasToContent={fitCanvasToContent}
      fetchWidgets={fetchWidgets}
      saveWidget={saveWidget}
      loadWidget={loadWidget}
      createNew={createNew}
      deleteWidget={deleteWidget}
      getUrl={getUrl}
    />
  );
}