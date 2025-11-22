/**
 * Main Application Entry Point (Page Controller)
 * 
 * This file serves as the root page for the application. In the Next.js App Router,
 * `page.tsx` is the default export that renders the route.
 * 
 * Architecture Note:
 * This component acts as a "Container" or "Controller" in the Container/Presentational pattern.
 * - It handles all the business logic, state management, and data fetching.
 * - It passes this data down to the `HomeView` component, which is responsible for rendering the UI.
 * 
 * Responsibilities:
 * 1. Initializing all global state hooks (Auth, Editor, Widget, History).
 * 2. Coordinating data flow between the state layer and the view layer.
 * 3. Handling initial data fetching and URL parameter parsing.
 * 4. Managing the "dirty" state of widgets (unsaved changes).
 */
'use client'; // This directive marks this as a Client Component, allowing use of hooks like useState/useEffect.

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
  // --- Local State ---
  // Tracks which elements on the canvas are currently selected by the user.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Stores the current window origin (e.g., http://localhost:3000) for generating absolute URLs.
  const [origin, setOrigin] = useState('');
  
  // --- Custom Hooks (Controllers) ---
  // These hooks encapsulate specific domains of logic to keep this component clean.
  
  const editorState = useEditorState(); // Manages canvas settings (width, height, background)
  const widgetState = useWidgetState(); // Manages widget metadata (name, saved ID, list of saved widgets)
  const fontState = useFonts();         // Manages available fonts and loading them
  const { user, isAuthLoading, login, logout } = useAuth(); // Manages Firebase authentication

  // --- History Management ---
  // Handles Undo/Redo functionality by keeping a stack of previous element states.
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
    // Default initial elements so the canvas isn't empty when first loaded
    { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20, strokeWidth: 2 } },
    { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20, strokeWidth: 2 } },
  ]);

  // --- Canvas Operations ---
  // Provides functions to manipulate the canvas elements (add, delete, align, fit).
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

  // --- Storage Operations ---
  // Handles saving, loading, and deleting widgets from the database (Firebase).
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

  // --- Browser Safety ---
  // Warns the user if they try to close the tab with unsaved changes.
  useUnsavedChanges(widgetState.savedWidgets);

  // --- Effects ---

  // 1. Auto-Update Saved Widget State
  // When any property of the widget changes (elements, settings, etc.), we update the 
  // local representation of the saved widget to mark it as "dirty" (unsaved changes).
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
          bgColor: editorState.bgColor,
          blobColor: editorState.blobColor,
          bgGradient: editorState.bgGradient,
          dirty: true // Mark as modified
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
    editorState.bgColor,
    editorState.blobColor,
    editorState.bgGradient,
    widgetState.widgetName, 
    widgetState.savedId
  ]);

  // 2. Fetch Widgets on Login
  // When the user logs in, we immediately fetch their saved widgets.
  useEffect(() => {
    if (user) {
      fetchWidgets(user);
    }
  }, [user]);

  // 3. Set Origin
  // We need the window.location.origin to generate correct share URLs.
  // This must be done in useEffect because 'window' is not available during server-side rendering.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Helper to generate the API URL for the current widget state
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
    bgColor: editorState.bgColor,
    blobColor: editorState.blobColor,
    bgGradient: editorState.bgGradient,
    origin,
    forcePreview
  });

  // Render the View
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