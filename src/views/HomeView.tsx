/**
 * HomeView.tsx
 * 
 * This is the main presentation component for the application.
 * It implements the UI layout including:
 * - Header: Navigation, Auth controls, Save/Preview actions.
 * - Sidebar: Widget management, Canvas settings, Element properties.
 * - Main Area: The interactive CanvasEditor and Zoom controls.
 * - Preview Modal: Live preview with Dark/Light mode toggle and Zoom.
 * 
 * Updates:
 * - Added Dark Mode toggle for preview to test transparency.
 * - Refactored color pickers to use a custom "filled button" style.
 * - Replaced iframe with img in preview for better transparency support.
 * 
 * This component is "dumb" in that it relies on props for all state and actions,
 * following the Presentational Component pattern.
 */
import React from 'react';
import dynamic from 'next/dynamic';
import { Icons } from '@/views/components/Icons';
import { NumberInput } from '@/views/components/NumberInput';
import { Switch } from '@/views/components/Switch';
import { GradientSlider } from '@/views/components/GradientSlider';
import { CanvasElement } from '@/models/types';

// Dynamically import CanvasEditor to avoid SSR issues with Konva
const CanvasEditor = dynamic(() => import('@/views/components/CanvasEditor'), { ssr: false });

interface HomeViewProps {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  editorState: any;
  widgetState: any;
  fontState: any;
  user: any;
  login: () => void;
  logout: () => void;
  elements: CanvasElement[];
  history: any[];
  historyStep: number;
  handleElementsChange: (elements: CanvasElement[], saveHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  addText: () => void;
  addImage: () => void;
  updateSelected: (key: keyof CanvasElement, value: any, saveHistory?: boolean) => void;
  deleteSelected: () => void;
  fitToWidth: () => void;
  fitToHeight: () => void;
  handleAlignChange: (align: 'start' | 'middle' | 'end') => void;
  fitCanvasToContent: () => void;
  fetchWidgets: (user: any) => void;
  saveWidget: () => void;
  loadWidget: (widget: any) => void;
  createNew: () => void;
  deleteWidget: (id: string, e: React.MouseEvent) => void;
  duplicateWidget: (id: string, e: React.MouseEvent) => void;
  getUrl: (forcePreview?: boolean) => string;
}

export function HomeView({
  selectedIds,
  setSelectedIds,
  editorState,
  widgetState,
  fontState,
  user,
  login,
  logout,
  elements,
  history,
  historyStep,
  handleElementsChange,
  undo,
  redo,
  addText,
  addImage,
  updateSelected,
  deleteSelected,
  fitToWidth,
  fitToHeight,
  handleAlignChange,
  fitCanvasToContent,
  saveWidget,
  loadWidget,
  createNew,
  deleteWidget,
  duplicateWidget,
  getUrl
}: HomeViewProps) {
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewZoom, setPreviewZoom] = React.useState(1);
  const [previewDarkMode, setPreviewDarkMode] = React.useState(true);

  // Layering Logic
  const moveSelected = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length === 0) return;
    
    let newElements = [...elements];
    // Get indices of selected items sorted ascending
    const selectedIndices = elements
      .map((el, i) => selectedIds.includes(el.id) ? i : -1)
      .filter(i => i !== -1)
      .sort((a, b) => a - b);
    
    if (selectedIndices.length === 0) return;

    if (direction === 'front') {
        // Move all selected to the end
        const selectedEls = selectedIndices.map(i => newElements[i]);
        const unselectedEls = newElements.filter((_, i) => !selectedIndices.includes(i));
        newElements = [...unselectedEls, ...selectedEls];
    } else if (direction === 'back') {
        // Move all selected to the start
        const selectedEls = selectedIndices.map(i => newElements[i]);
        const unselectedEls = newElements.filter((_, i) => !selectedIndices.includes(i));
        newElements = [...selectedEls, ...unselectedEls];
    } else if (direction === 'forward') {
        // Move each selected item one step up (iterate from end to start)
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
            const idx = selectedIndices[i];
            if (idx < newElements.length - 1) {
               [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
            }
        }
    } else if (direction === 'backward') {
        // Iterate from start to end
        for (let i = 0; i < selectedIndices.length; i++) {
            const idx = selectedIndices[i];
            if (idx > 0) {
                [newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];
            }
        }
    }
    
    handleElementsChange(newElements);
  };

  // Helper to get opacity percentage from color string
  const getOpacity = (color: string): number => {
    if (!color) return 100;
    if (color === 'transparent') return 0;
    if (color.startsWith('#')) {
      if (color.length === 9) { // #RRGGBBAA
        return Math.round((parseInt(color.slice(7, 9), 16) / 255) * 100);
      }
      return 100;
    }
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\(.*,\s*([\d.]+)\)/);
      if (match) return Math.round(parseFloat(match[1]) * 100);
    }
    return 100;
  };

  // Helper to set opacity on color string
  const setOpacity = (color: string, opacity: number): string => {
    const alpha = Math.max(0, Math.min(100, opacity));
    
    // Handle Hex
    if (color.startsWith('#')) {
      let hex = color;
      if (hex.length === 4) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      if (hex.length === 9) hex = hex.slice(0, 7); // Strip existing alpha
      
      const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
      return `${hex}${alphaHex}`;
    }
    
    // Handle RGB/RGBA
    if (color.startsWith('rgb')) {
      const nums = color.match(/\d+/g);
      if (nums && nums.length >= 3) {
        return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha / 100})`;
      }
    }
    
    // Fallback for named colors or others: return as is if 100%, else try to convert?
    // For simplicity, if it's not hex/rgb, we can't easily add alpha without a library.
    // But we can return the color as is if opacity is 100.
    return color;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Beta Warning Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-center py-1.5 px-4">
        <p className="text-xs font-medium text-amber-200/80">
          🚧 <span className="font-bold text-amber-200">Work in Progress:</span> You may encounter bugs as I am still working on this project.
        </p>
      </div>

      {/* Header Section */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20" />
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Readme Widget
            </span>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-800">
              <a
                href="https://github.com/H-Loon/my-readme-widget"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                title="View Project on GitHub"
                aria-label="View Project on GitHub"
              >
                <Icons.Github size={20} />
              </a>
              <a
                href="https://github.com/H-Loon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium text-slate-500 hover:text-blue-400 hover:border-blue-400 transition-colors border border-slate-800 rounded-full px-2 py-0.5 bg-slate-900/50"
              >
                Made by H-Loon
              </a>
              <button
                onClick={() => window.open('https://github.com/H-Loon/my-readme-widget/issues/new?title=Issue:%20', '_blank')}
                className="text-[10px] font-medium text-slate-500 hover:text-red-400 hover:border-red-400 transition-colors border border-slate-800 rounded-full px-2 py-0.5 bg-slate-900/50"
              >
                Report Issue
              </button>
              <button
                onClick={() => window.open('https://github.com/H-Loon/my-readme-widget/issues/new?labels=enhancement&title=Feature%20Request:%20', '_blank')}
                className="text-[10px] font-medium text-slate-500 hover:text-yellow-400 hover:border-yellow-400 transition-colors border border-slate-800 rounded-full px-2 py-0.5 bg-slate-900/50"
              >
                Ask Feature
              </button>
            </div>
          </div>

          {/* Center Controls: Undo/Redo and Widget Name */}
          <div className="flex-1 max-w-xl flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-slate-800">
              <button
                onClick={undo}
                disabled={historyStep === 0}
                className="p-2 hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Icons.Undo size={18} />
              </button>
              <button
                onClick={redo}
                disabled={historyStep === history.length - 1}
                className="p-2 hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Icons.Redo size={18} />
              </button>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={widgetState.widgetName}
                onChange={(e) => widgetState.setWidgetName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Widget Name"
                aria-label="Widget Name"
              />
            </div>
          </div>

          {/* Right Controls: Preview, Copy, Save, Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              <Icons.Eye size={16} /> Preview
            </button>
            <button
              onClick={() => {
                const markdown = `![${widgetState.widgetName || 'Widget'}](${getUrl()})`;
                navigator.clipboard.writeText(markdown);
                alert("Markdown copied to clipboard!");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              <Icons.Copy size={16} /> Copy Markdown
            </button>
            <button
              onClick={saveWidget}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 transition-all"
            >
              <Icons.Save size={16} /> Save
            </button>
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-slate-700" />
                <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Logout</button>
              </div>
            ) : (
              <button onClick={login} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors">
                <Icons.User size={16} /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-64px)]">
        {/* Sidebar: Settings and Properties */}
        <aside className="w-80 bg-slate-900/50 border-r border-slate-800 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 space-y-6">

          {/* Saved Widgets List */}
          {widgetState.savedWidgets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Widgets</h3>
              <div className="space-y-2">
                <button
                  onClick={createNew}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors text-xs font-medium"
                >
                  <Icons.Plus size={14} /> New Widget
                </button>
                {widgetState.savedWidgets.map((w: any) => (
                  <div
                    key={w.id}
                    onClick={() => loadWidget(w)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-md border transition-all cursor-pointer ${
                      widgetState.savedId === w.id
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <span className={`text-xs font-medium truncate ${widgetState.savedId === w.id ? 'text-blue-200' : 'text-slate-300'}`}>
                      {w.name}
                      {(w.dirty || w.id.startsWith('temp_')) && <span className="text-amber-400 ml-1">*</span>}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => duplicateWidget(w.id, e)}
                        className="text-slate-500 hover:text-blue-400"
                        aria-label={`Duplicate widget ${w.name}`}
                        title="Duplicate"
                      >
                        <Icons.Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => deleteWidget(w.id, e)}
                        className="text-slate-500 hover:text-red-400"
                        aria-label={`Delete widget ${w.name}`}
                        title="Delete"
                      >
                        <Icons.Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Settings (Dimensions, Theme, Background) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canvas Settings</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Width</label>
                <NumberInput
                  value={editorState.canvasWidth}
                  onChange={(val) => editorState.setCanvasWidth(val)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                  aria-label="Canvas Width"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Height</label>
                <NumberInput
                  value={editorState.canvasHeight}
                  onChange={(val) => editorState.setCanvasHeight(val)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                  aria-label="Canvas Height"
                />
              </div>
            </div>

            <button onClick={fitCanvasToContent} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md text-xs font-medium transition-colors">
              <Icons.Fit size={14} /> Fit to Content
            </button>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400">Background Style</label>
              <div className="grid grid-cols-2 gap-2">
                {['transparent', 'custom', 'ethereal', 'image'].map(s => (
                  <button
                    key={s}
                    onClick={() => editorState.setStyle(s)}
                    className={`px-2 py-1.5 rounded text-xs font-medium capitalize border transition-all ${editorState.style === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {(editorState.style === 'custom' || editorState.style === 'ethereal') && (
              <div className="space-y-4 pt-2 border-t border-slate-800/50">
                
                {/* Blob Count for Ethereal */}
                {editorState.style === 'ethereal' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[11px] font-medium text-slate-400">Blob Count</label>
                      <span className="text-[10px] text-slate-500 font-mono">{editorState.blobCount}</span>
                    </div>
                    <input
                      type="range"
                      min="1" max="100"
                      value={editorState.blobCount}
                      onChange={(e) => editorState.setBlobCount(Number(e.target.value))}
                      className="w-full custom-range"
                      aria-label="Blob Count"
                    />
                  </div>
                )}

                {/* Gradient Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-400">Gradient Fill</label>
                  <Switch
                    checked={editorState.bgGradient.enabled}
                    onChange={(checked) => editorState.setBgGradient({ ...editorState.bgGradient, enabled: checked })}
                    aria-label="Toggle Gradient Fill"
                  />
                </div>

                {/* Solid Color Picker (only if gradient is disabled) */}
                {!editorState.bgGradient.enabled && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400">
                      {editorState.style === 'ethereal' ? 'Blob Color' : 'Background Color'}
                    </label>
                    <div className="flex items-center gap-2 h-[34px]">
                      <input
                        type="text"
                        value={editorState.style === 'ethereal' ? editorState.blobColor : editorState.bgColor}
                        onChange={(e) => editorState.style === 'ethereal' ? editorState.setBlobColor(e.target.value) : editorState.setBgColor(e.target.value)}
                        className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                        aria-label={editorState.style === 'ethereal' ? 'Blob Color Hex' : 'Background Color Hex'}
                      />
                      <div className="relative w-8 h-8 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                        <div className="absolute inset-0" style={{ backgroundColor: (editorState.style === 'ethereal' ? editorState.blobColor : editorState.bgColor).startsWith('#') ? (editorState.style === 'ethereal' ? editorState.blobColor : editorState.bgColor) : '#000000' }} />
                        <input
                          type="color"
                          value={(editorState.style === 'ethereal' ? editorState.blobColor : editorState.bgColor).startsWith('#') ? (editorState.style === 'ethereal' ? editorState.blobColor : editorState.bgColor) : '#000000'}
                          onChange={(e) => editorState.style === 'ethereal' ? editorState.setBlobColor(e.target.value) : editorState.setBgColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={editorState.style === 'ethereal' ? 'Blob Color Picker' : 'Background Color Picker'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Gradient Controls */}
                {editorState.bgGradient.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400">Type</label>
                      <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800 h-[34px]">
                        <button
                          onClick={() => editorState.setBgGradient({ ...editorState.bgGradient, type: 'linear' })}
                          className={`flex-1 text-[10px] rounded transition-colors ${editorState.bgGradient.type !== 'radial' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        >
                          Linear
                        </button>
                        <button
                          onClick={() => editorState.setBgGradient({ ...editorState.bgGradient, type: 'radial' })}
                          className={`flex-1 text-[10px] rounded transition-colors ${editorState.bgGradient.type === 'radial' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        >
                          Radial
                        </button>
                      </div>
                    </div>

                    {editorState.bgGradient.type !== 'radial' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Angle ({editorState.bgGradient.angle}°)</label>
                        <input
                          type="range"
                          min="0" max="360"
                          value={editorState.bgGradient.angle}
                          onChange={(e) => editorState.setBgGradient({ ...editorState.bgGradient, angle: Number(e.target.value) })}
                          className="w-full custom-range"
                          aria-label="Gradient Angle"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-slate-400">Gradient Preview</label>
                      <GradientSlider
                        stops={editorState.bgGradient.stops}
                        onChange={(newStops) => editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-slate-400">Colors</label>
                      {editorState.bgGradient.stops.map((stop: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                            <div className="absolute inset-0" style={{ backgroundColor: stop.color }} />
                            <input
                              type="color"
                              value={stop.color}
                              onChange={(e) => {
                                const newStops = [...editorState.bgGradient.stops];
                                newStops[idx] = { ...newStops[idx], color: e.target.value };
                                editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops });
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              aria-label={`Gradient Stop Color ${idx + 1}`}
                            />
                          </div>
                          <input
                            type="text"
                            value={stop.color}
                            onChange={(e) => {
                              const newStops = [...editorState.bgGradient.stops];
                              newStops[idx] = { ...newStops[idx], color: e.target.value };
                              editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops });
                            }}
                            className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none transition-all"
                            aria-label={`Gradient Stop Color Code ${idx + 1}`}
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={getOpacity(stop.color)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newStops = [...editorState.bgGradient.stops];
                                newStops[idx] = { ...newStops[idx], color: setOpacity(stop.color, val) };
                                editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops });
                                if (/^0[0-9]/.test(e.target.value)) {
                                  e.target.value = String(val);
                                }
                              }}
                              className="w-12 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-right focus:border-blue-500 outline-none transition-all"
                              title="Opacity %"
                              aria-label={`Gradient Stop Opacity ${idx + 1}`}
                            />
                            <span className="text-xs text-slate-500 opacity-50">Op</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(stop.offset * 100)}
                              onChange={(e) => {
                                const rawVal = Number(e.target.value);
                                const val = Math.max(0, Math.min(100, rawVal));
                                const newStops = [...editorState.bgGradient.stops];
                                newStops[idx] = { ...newStops[idx], offset: val / 100 };
                                editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops });
                                if (/^0[0-9]/.test(e.target.value)) {
                                  e.target.value = String(val);
                                }
                              }}
                              className="w-12 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-right focus:border-blue-500 outline-none transition-all"
                              aria-label={`Gradient Stop Offset ${idx + 1}`}
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                          <button
                            onClick={() => {
                              const newStops = editorState.bgGradient.stops.filter((_: any, i: number) => i !== idx);
                              editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops });
                            }}
                            className="text-slate-600 hover:text-red-400"
                            aria-label={`Delete Gradient Stop ${idx + 1}`}
                          >
                            <Icons.Trash size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newStops = [...editorState.bgGradient.stops, { offset: 0.5, color: '#ffffff' }];
                          editorState.setBgGradient({ ...editorState.bgGradient, stops: newStops.sort((a: any, b: any) => a.offset - b.offset) });
                        }}
                        className="w-full py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700 transition-colors"
                      >
                        + Add Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {editorState.style === 'image' && (
              <div className="space-y-2 pt-2 border-t border-slate-800/50">
                <label className="text-[11px] font-medium text-slate-400">Background Image URL</label>
                <input
                  type="text"
                  value={editorState.bgImage}
                  onChange={(e) => editorState.setBgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                  aria-label="Background Image URL"
                />
                {editorState.bgImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => editorState.setBgFit('cover')}
                      className={`flex-1 py-1.5 text-[10px] font-medium rounded border transition-all ${editorState.bgFit === 'cover' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                    >
                      Cover
                    </button>
                    <button
                      onClick={() => editorState.setBgFit('contain')}
                      className={`flex-1 py-1.5 text-[10px] font-medium rounded border transition-all ${editorState.bgFit === 'contain' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                    >
                      Contain
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <label className="text-[11px] font-medium text-slate-400">Show Grid</label>
              <Switch checked={editorState.showGrid} onChange={editorState.setShowGrid} aria-label="Toggle Grid" />
            </div>
          </div>

          {/* Add Elements Buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={addText} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg transition-all text-xs font-medium">
                <Icons.Plus size={16} /> Add Text
              </button>
              <button onClick={addImage} className="flex items-center justify-center gap-2 px-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg transition-all text-xs font-medium">
                <Icons.Image size={16} /> Add Image/MD
              </button>
            </div>
          </div>

          {/* Selected Element Properties Panel */}
          {selectedIds.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedIds.length > 1 ? `${selectedIds.length} Elements Selected` : 'Selected Element'}
                </h3>
                <button onClick={deleteSelected} className="text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete Selected Element">
                  <Icons.Trash size={16} />
                </button>
              </div>

              {/* Layering Controls */}
              <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
                <button
                  onClick={() => moveSelected('back')}
                  className="flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-200"
                  title="Send to Back"
                  aria-label="Send to Back"
                >
                  <Icons.ChevronsDown size={16} />
                </button>
                <button
                  onClick={() => moveSelected('backward')}
                  className="flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-200"
                  title="Send Backward"
                  aria-label="Send Backward"
                >
                  <Icons.ArrowDown size={16} />
                </button>
                <button
                  onClick={() => moveSelected('forward')}
                  className="flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-200"
                  title="Bring Forward"
                  aria-label="Bring Forward"
                >
                  <Icons.ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveSelected('front')}
                  className="flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-200"
                  title="Bring to Front"
                  aria-label="Bring to Front"
                >
                  <Icons.ChevronsUp size={16} />
                </button>
              </div>

              {selectedIds.length > 1 && (
                <div className="text-xs text-slate-500 italic">
                  Editing properties will apply to all selected items.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">X</label>
                  <NumberInput
                    value={Math.round(elements.find(el => el.id === selectedIds[0])?.x || 0)}
                    onChange={(val) => updateSelected('x', val)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                    aria-label="X Position"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Y</label>
                  <NumberInput
                    value={Math.round(elements.find(el => el.id === selectedIds[0])?.y || 0)}
                    onChange={(val) => updateSelected('y', val)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                    aria-label="Y Position"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Opacity ({Math.round((elements.find(el => el.id === selectedIds[0])?.opacity ?? 1) * 100)}%)</label>
                <input
                  type="range"
                  min="0" max="1"
                  step="0.01"
                  value={elements.find(el => el.id === selectedIds[0])?.opacity ?? 1}
                  onChange={(e) => updateSelected('opacity', Number(e.target.value), false)}
                  onMouseUp={(e) => updateSelected('opacity', Number(e.currentTarget.value), true)}
                  onTouchEnd={(e) => updateSelected('opacity', Number(e.currentTarget.value), true)}
                  className="w-full custom-range"
                  aria-label="Element Opacity"
                />
              </div>

              {/* Text Properties */}
              {elements.find(el => el.id === selectedIds[0])?.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Text Content</label>
                    <textarea
                      value={elements.find(el => el.id === selectedIds[0])?.text || ''}
                      onChange={(e) => updateSelected('text', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none resize-y min-h-[80px] transition-all"
                      aria-label="Text Content"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Font Size</label>
                        <NumberInput
                          value={elements.find(el => el.id === selectedIds[0])?.size || 16}
                          onChange={(val) => updateSelected('size', val)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                          aria-label="Font Size"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Letter Spacing</label>
                        <NumberInput
                          value={elements.find(el => el.id === selectedIds[0])?.letterSpacing || 0}
                          onChange={(val) => updateSelected('letterSpacing', val)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                          aria-label="Letter Spacing"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Color</label>
                        <div className="flex items-center gap-2 h-[34px]">
                          <input
                            type="text"
                            value={elements.find(el => el.id === selectedIds[0])?.color || '#000000'}
                            onChange={(e) => updateSelected('color', e.target.value)}
                            className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                            aria-label="Text Color Hex"
                          />
                          <div className="relative w-8 h-8 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                            <div className="absolute inset-0" style={{ backgroundColor: (elements.find(el => el.id === selectedIds[0])?.color || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.color : '#000000' }} />
                            <input
                              type="color"
                              value={(elements.find(el => el.id === selectedIds[0])?.color || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.color : '#000000'}
                              onChange={(e) => updateSelected('color', e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              aria-label="Text Color Picker"
                            />
                          </div>
                        </div>
                        {/* Document Colors */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Array.from(new Set(elements.filter(el => el.type === 'text' && el.color).map(el => el.color))).map((c: any) => (
                            <button
                              key={c}
                              onClick={() => updateSelected('color', c)}
                              className="w-5 h-5 rounded border border-slate-700 hover:border-slate-500 hover:scale-110 transition-all"
                              style={{ backgroundColor: c }}
                              title={c}
                              aria-label={`Set color to ${c}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-[11px] font-medium text-slate-400">Font Family</label>
                      <div
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 cursor-pointer flex justify-between items-center hover:border-slate-700 transition-all"
                        onClick={() => fontState.setShowFontList(!fontState.showFontList)}
                      >
                        <span className="truncate">{elements.find(el => el.id === selectedIds[0])?.fontFamily || 'sans-serif'}</span>
                        <Icons.Move size={12} className="rotate-90 text-slate-500" />
                      </div>
                      {fontState.showFontList && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-800 rounded-md shadow-xl z-50 custom-scrollbar">
                          <div className="p-2 sticky top-0 bg-slate-900 border-b border-slate-800">
                            <input
                              type="text"
                              value={fontState.fontSearch}
                              onChange={(e) => fontState.setFontSearch(e.target.value)}
                              placeholder="Search fonts..."
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                              autoFocus
                              aria-label="Search Fonts"
                            />
                          </div>
                          {['sans-serif', 'serif', 'monospace', ...fontState.googleFonts]
                            .filter(f => f.toLowerCase().includes(fontState.fontSearch.toLowerCase()))
                            .map(font => (
                              <div
                                key={font}
                                onClick={() => {
                                  updateSelected('fontFamily', font);
                                  fontState.setShowFontList(false);
                                  fontState.setFontSearch('');
                                }}
                                className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer truncate"
                                style={{ fontFamily: font }}
                              >
                                {font}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => updateSelected('bold', !elements.find(el => el.id === selectedIds[0])?.bold)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.bold ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Toggle Bold"
                      >
                        <Icons.Bold size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('italic', !elements.find(el => el.id === selectedIds[0])?.italic)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.italic ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Toggle Italic"
                      >
                        <Icons.Italic size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('underline', !elements.find(el => el.id === selectedIds[0])?.underline)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.underline ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Toggle Underline"
                      >
                        <Icons.Underline size={16} />
                      </button>
                    </div>

                    <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleAlignChange('start')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'start' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Align Left"
                      >
                        <Icons.AlignLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('middle')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'middle' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Align Center"
                      >
                        <Icons.AlignCenter size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('end')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'end' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                        aria-label="Align Right"
                      >
                        <Icons.AlignRight size={16} />
                      </button>
                    </div>

                    {/* Shadow Controls */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-400">Shadow</label>
                        <Switch
                          checked={elements.find(el => el.id === selectedIds[0])?.shadowEnabled || false}
                          onChange={(checked) => updateSelected('shadowEnabled', checked)}
                          aria-label="Toggle Shadow"
                        />
                      </div>
                      {elements.find(el => el.id === selectedIds[0])?.shadowEnabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Color</label>
                            <div className="flex items-center gap-2 h-[34px]">
                              <input
                                type="text"
                                value={elements.find(el => el.id === selectedIds[0])?.shadowColor || '#000000'}
                                onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                                aria-label="Shadow Color Hex"
                              />
                              <div className="relative w-8 h-8 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                                <div className="absolute inset-0" style={{ backgroundColor: (elements.find(el => el.id === selectedIds[0])?.shadowColor || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.shadowColor : '#000000' }} />
                                <input
                                  type="color"
                                  value={(elements.find(el => el.id === selectedIds[0])?.shadowColor || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.shadowColor : '#000000'}
                                  onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  aria-label="Shadow Color Picker"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Blur</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowBlur || 0}
                              onChange={(val) => updateSelected('shadowBlur', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                              aria-label="Shadow Blur"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset X</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowOffsetX || 0}
                              onChange={(val) => updateSelected('shadowOffsetX', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                              aria-label="Shadow Offset X"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset Y</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowOffsetY || 0}
                              onChange={(val) => updateSelected('shadowOffsetY', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                              aria-label="Shadow Offset Y"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Neon Effect */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-400">Neon Glow</label>
                        <Switch
                          checked={elements.find(el => el.id === selectedIds[0])?.neon?.enabled || false}
                          onChange={(checked) => {
                            const el = elements.find(el => el.id === selectedIds[0]);
                            updateSelected('neon', { ...el?.neon, enabled: checked });
                          }}
                          aria-label="Toggle Neon Glow"
                        />
                      </div>
                      {elements.find(el => el.id === selectedIds[0])?.neon?.enabled && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Glow Color</label>
                            <div className="flex items-center gap-2 h-[34px]">
                              <input
                                type="text"
                                value={elements.find(el => el.id === selectedIds[0])?.neon?.color || '#00ff00'}
                                onChange={(e) => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('neon', { ...el?.neon, color: e.target.value });
                                }}
                                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                                aria-label="Neon Glow Color Hex"
                              />
                              <div className="relative w-8 h-8 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                                <div className="absolute inset-0" style={{ backgroundColor: (elements.find(el => el.id === selectedIds[0])?.neon?.color || '#00ff00').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.neon?.color : '#00ff00' }} />
                                <input
                                  type="color"
                                  value={(elements.find(el => el.id === selectedIds[0])?.neon?.color || '#00ff00').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.neon?.color : '#00ff00'}
                                  onChange={(e) => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    updateSelected('neon', { ...el?.neon, color: e.target.value });
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  aria-label="Neon Glow Color Picker"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Intensity</label>
                            <input
                              type="range"
                              min="0.1" max="100"
                              step="0.1"
                              value={elements.find(el => el.id === selectedIds[0])?.neon?.intensity || 20}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, intensity: Number(e.target.value) }, false);
                              }}
                              onMouseUp={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, intensity: Number(e.currentTarget.value) }, true);
                              }}
                              onTouchEnd={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, intensity: Number(e.currentTarget.value) }, true);
                              }}
                              className="w-full custom-range"
                              aria-label="Neon Intensity"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Propagation</label>
                            <input
                              type="range"
                              min="1" max="5"
                              step="0.1"
                              value={elements.find(el => el.id === selectedIds[0])?.neon?.propagation || 2}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, propagation: Number(e.target.value) }, false);
                              }}
                              onMouseUp={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, propagation: Number(e.currentTarget.value) }, true);
                              }}
                              onTouchEnd={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, propagation: Number(e.currentTarget.value) }, true);
                              }}
                              className="w-full custom-range"
                              aria-label="Neon Propagation"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Stroke Width</label>
                            <input
                              type="range"
                              min="0.1" max="10"
                              step="0.1"
                              value={elements.find(el => el.id === selectedIds[0])?.neon?.strokeWidth || 2}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, strokeWidth: Number(e.target.value) }, false);
                              }}
                              onMouseUp={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, strokeWidth: Number(e.currentTarget.value) }, true);
                              }}
                              onTouchEnd={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('neon', { ...el?.neon, strokeWidth: Number(e.currentTarget.value) }, true);
                              }}
                              className="w-full custom-range"
                              aria-label="Neon Stroke Width"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Background */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-400">Text Background</label>
                        <Switch
                          checked={elements.find(el => el.id === selectedIds[0])?.textBg?.enabled || false}
                          onChange={(checked) => {
                            const el = elements.find(el => el.id === selectedIds[0]);
                            updateSelected('textBg', { 
                                enabled: checked,
                                color: el?.textBg?.color || '#000000',
                                opacity: el?.textBg?.opacity ?? 1,
                                mode: el?.textBg?.mode || 'fit',
                                padding: el?.textBg?.padding ?? 4,
                                borderRadius: el?.textBg?.borderRadius ?? 4
                            });
                          }}
                          aria-label="Toggle Text Background"
                        />
                      </div>
                      {elements.find(el => el.id === selectedIds[0])?.textBg?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-slate-400">Color</label>
                                <div className="flex items-center gap-2 h-[34px]">
                                  <input
                                    type="text"
                                    value={elements.find(el => el.id === selectedIds[0])?.textBg?.color || '#000000'}
                                    onChange={(e) => {
                                      const el = elements.find(el => el.id === selectedIds[0]);
                                      updateSelected('textBg', { ...el?.textBg, color: e.target.value });
                                    }}
                                    className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                                  />
                                  <div className="relative w-8 h-8 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                                    <div className="absolute inset-0" style={{ backgroundColor: elements.find(el => el.id === selectedIds[0])?.textBg?.color || '#000000' }} />
                                    <input
                                      type="color"
                                      value={elements.find(el => el.id === selectedIds[0])?.textBg?.color || '#000000'}
                                      onChange={(e) => {
                                        const el = elements.find(el => el.id === selectedIds[0]);
                                        updateSelected('textBg', { ...el?.textBg, color: e.target.value });
                                      }}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-slate-400">Mode</label>
                                <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800 h-[34px]">
                                    <button
                                        onClick={() => {
                                            const el = elements.find(el => el.id === selectedIds[0]);
                                            updateSelected('textBg', { ...el?.textBg, mode: 'fit' });
                                        }}
                                        className={`flex-1 text-[10px] rounded transition-colors ${elements.find(el => el.id === selectedIds[0])?.textBg?.mode !== 'block' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                                    >
                                        Fit
                                    </button>
                                    <button
                                        onClick={() => {
                                            const el = elements.find(el => el.id === selectedIds[0]);
                                            updateSelected('textBg', { ...el?.textBg, mode: 'block' });
                                        }}
                                        className={`flex-1 text-[10px] rounded transition-colors ${elements.find(el => el.id === selectedIds[0])?.textBg?.mode === 'block' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                                    >
                                        Block
                                    </button>
                                </div>
                              </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Opacity ({Math.round((elements.find(el => el.id === selectedIds[0])?.textBg?.opacity ?? 1) * 100)}%)</label>
                            <input
                              type="range"
                              min="0" max="1"
                              step="0.01"
                              value={elements.find(el => el.id === selectedIds[0])?.textBg?.opacity ?? 1}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('textBg', { ...el?.textBg, opacity: Number(e.target.value) }, false);
                              }}
                              onMouseUp={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('textBg', { ...el?.textBg, opacity: Number(e.currentTarget.value) }, true);
                              }}
                              onTouchEnd={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('textBg', { ...el?.textBg, opacity: Number(e.currentTarget.value) }, true);
                              }}
                              className="w-full custom-range"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-slate-400">Padding</label>
                                <NumberInput
                                  value={elements.find(el => el.id === selectedIds[0])?.textBg?.padding ?? 4}
                                  onChange={(val) => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    updateSelected('textBg', { ...el?.textBg, padding: val });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-slate-400">Radius</label>
                                <NumberInput
                                  value={elements.find(el => el.id === selectedIds[0])?.textBg?.borderRadius ?? 4}
                                  onChange={(val) => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    updateSelected('textBg', { ...el?.textBg, borderRadius: val });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gradient */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-400">Gradient Fill</label>
                        <Switch
                          checked={elements.find(el => el.id === selectedIds[0])?.gradient?.enabled || false}
                          onChange={(checked) => {
                            const el = elements.find(el => el.id === selectedIds[0]);
                            updateSelected('gradient', { ...el?.gradient, enabled: checked });
                          }}
                          aria-label="Toggle Gradient Fill"
                        />
                      </div>
                      {elements.find(el => el.id === selectedIds[0])?.gradient?.enabled && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Type</label>
                            <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800 h-[34px]">
                              <button
                                onClick={() => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('gradient', { ...el?.gradient, type: 'linear' });
                                }}
                                className={`flex-1 text-[10px] rounded transition-colors ${elements.find(el => el.id === selectedIds[0])?.gradient?.type !== 'radial' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                              >
                                Linear
                              </button>
                              <button
                                onClick={() => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('gradient', { ...el?.gradient, type: 'radial' });
                                }}
                                className={`flex-1 text-[10px] rounded transition-colors ${elements.find(el => el.id === selectedIds[0])?.gradient?.type === 'radial' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                              >
                                Radial
                              </button>
                            </div>
                          </div>

                          {elements.find(el => el.id === selectedIds[0])?.gradient?.type !== 'radial' && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-slate-400">Angle ({elements.find(el => el.id === selectedIds[0])?.gradient?.angle}°)</label>
                              <input
                                type="range"
                                min="0" max="360"
                                value={elements.find(el => el.id === selectedIds[0])?.gradient?.angle || 90}
                                onChange={(e) => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('gradient', { ...el?.gradient, angle: Number(e.target.value) }, false);
                                }}
                                onMouseUp={(e) => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('gradient', { ...el?.gradient, angle: Number(e.currentTarget.value) }, true);
                                }}
                                onTouchEnd={(e) => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('gradient', { ...el?.gradient, angle: Number(e.currentTarget.value) }, true);
                                }}
                                className="w-full custom-range"
                                aria-label="Gradient Angle"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Gradient Preview</label>
                            <GradientSlider
                              stops={elements.find(el => el.id === selectedIds[0])?.gradient?.stops || []}
                              onChange={(newStops) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('gradient', { ...el?.gradient, stops: newStops }, false);
                              }}
                              onAfterChange={(newStops) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('gradient', { ...el?.gradient, stops: newStops }, true);
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Colors</label>
                            {elements.find(el => el.id === selectedIds[0])?.gradient?.stops?.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden shrink-0 hover:border-slate-500 transition-colors">
                                  <div className="absolute inset-0" style={{ backgroundColor: stop.color.startsWith('#') ? stop.color : '#000000' }} />
                                  <input
                                    type="color"
                                    value={stop.color.startsWith('#') ? stop.color : '#000000'}
                                    onChange={(e) => {
                                      const el = elements.find(el => el.id === selectedIds[0]);
                                      const newStops = [...(el?.gradient?.stops || [])];
                                      newStops[idx] = { ...newStops[idx], color: e.target.value };
                                      updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label={`Gradient Stop Color ${idx + 1}`}
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={stop.color}
                                  onChange={(e) => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    const newStops = [...(el?.gradient?.stops || [])];
                                    newStops[idx] = { ...newStops[idx], color: e.target.value };
                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                  }}
                                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none transition-all"
                                  aria-label={`Gradient Stop Color Code ${idx + 1}`}
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={getOpacity(stop.color)}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const el = elements.find(el => el.id === selectedIds[0]);
                                      const newStops = [...(el?.gradient?.stops || [])];
                                      newStops[idx] = { ...newStops[idx], color: setOpacity(stop.color, val) };
                                      updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                      if (/^0[0-9]/.test(e.target.value)) {
                                        e.target.value = String(val);
                                      }
                                    }}
                                    className="w-12 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-right focus:border-blue-500 outline-none transition-all"
                                    title="Opacity %"
                                    aria-label={`Gradient Stop Opacity ${idx + 1}`}
                                  />
                                  <span className="text-xs text-slate-500 opacity-50">Op</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={Math.round(stop.offset * 100)}
                                    onChange={(e) => {
                                      const rawVal = Number(e.target.value);
                                      const val = Math.max(0, Math.min(100, rawVal));
                                      const el = elements.find(el => el.id === selectedIds[0]);
                                      const newStops = [...(el?.gradient?.stops || [])];
                                      newStops[idx] = { ...newStops[idx], offset: val / 100 };
                                      updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                      if (/^0[0-9]/.test(e.target.value)) {
                                        e.target.value = String(val);
                                      }
                                    }}
                                    className="w-12 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-right focus:border-blue-500 outline-none transition-all"
                                    aria-label={`Gradient Stop Offset ${idx + 1}`}
                                  />
                                  <span className="text-xs text-slate-500">%</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    const newStops = (el?.gradient?.stops || []).filter((_, i) => i !== idx);
                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                  }}
                                  className="text-slate-600 hover:text-red-400"
                                  aria-label={`Delete Gradient Stop ${idx + 1}`}
                                >
                                  <Icons.Trash size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                const newStops = [...(el?.gradient?.stops || []), { offset: 0.5, color: '#ffffff' }];
                                updateSelected('gradient', { ...el?.gradient, stops: newStops.sort((a, b) => a.offset - b.offset) });
                              }}
                              className="w-full py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700 transition-colors"
                              aria-label="Add Gradient Stop"
                            >
                              + Add Stop
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Image Properties */}
              {elements.find(el => el.id === selectedIds[0])?.type === 'image' && (
                <>
                  <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                    <label className="text-[11px] font-medium text-blue-400">Image / Badge Source URL</label>
                    <input
                      type="text"
                      value={elements.find(el => el.id === selectedIds[0])?.src || ''}
                      onChange={(e) => updateSelected('src', e.target.value)}
                      placeholder="https://example.com/image.png or ![alt](url)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                      aria-label="Image URL"
                    />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Paste a direct image link, a shields.io badge URL, or even a Markdown image tag.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={fitToWidth} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md transition-all text-xs font-medium" aria-label="Fit Image to Width">
                      <Icons.Max size={14} /> Fit Width
                    </button>
                    <button onClick={fitToHeight} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md transition-all text-xs font-medium" aria-label="Fit Image to Height">
                      <Icons.Max size={14} className="rotate-90" /> Fit Height
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </aside>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-slate-950 relative overflow-auto custom-scrollbar flex">
          <div className="m-auto p-8 transition-all duration-200 ease-out" style={{
            width: `${editorState.canvasWidth * editorState.zoom + 64}px`,
            height: `${editorState.canvasHeight * editorState.zoom + 64}px`
          }}>
            <div style={{
              transform: `scale(${editorState.zoom})`,
              transformOrigin: 'top left',
            }}>
              <div className="relative shadow-2xl ring-1 ring-slate-800">
                <CanvasEditor
                  width={editorState.canvasWidth}
                  height={editorState.canvasHeight}
                  elements={elements}
                  selectedIds={selectedIds}
                  onSelect={setSelectedIds}
                  onChange={handleElementsChange}
                  bgImage={editorState.bgImage}
                  bgFit={editorState.bgFit}
                  theme={editorState.theme}
                  customFrom={editorState.customFrom}
                  customTo={editorState.customTo}
                  blobCount={editorState.blobCount}
                  showGrid={editorState.showGrid}
                  style={editorState.style}
                  bgColor={editorState.bgColor}
                  blobColor={editorState.blobColor}
                  bgGradient={editorState.bgGradient}
                />
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-800 z-10">
            <button
              onClick={() => editorState.setZoom((z: number) => Math.max(0.1, z - 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <Icons.ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(editorState.zoom * 100)}%
            </span>
            <button
              onClick={() => editorState.setZoom((z: number) => Math.min(3, z + 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <Icons.ZoomIn size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          {/* Toolbar */}
          <div 
            className="absolute top-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-800 z-10"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewZoom(z => Math.max(0.1, z - 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <Icons.ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              onClick={() => setPreviewZoom(z => Math.min(3, z + 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <Icons.ZoomIn size={16} />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => setPreviewDarkMode(!previewDarkMode)}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title={previewDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {previewDarkMode ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => setShowPreview(false)}
              className="px-3 py-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md text-slate-400 transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>

          {/* Content Container - Scrollable */}
          <div className="w-full h-full overflow-auto flex custom-scrollbar">
            <div 
              className="relative m-auto p-8"
              style={{
                width: `${editorState.canvasWidth * previewZoom + 64}px`,
                height: `${editorState.canvasHeight * previewZoom + 64}px`
              }}
            >
              <div 
                style={{ 
                  transform: `scale(${previewZoom})`, 
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s',
                  width: editorState.canvasWidth,
                  height: editorState.canvasHeight
                }} 
                onClick={e => e.stopPropagation()}
                className={`shadow-2xl relative transition-colors duration-300 ${previewDarkMode ? 'bg-[#0d1117]' : 'bg-white'}`}
              >
                <img 
                  src={getUrl(true)} 
                  width={editorState.canvasWidth} 
                  height={editorState.canvasHeight} 
                  className="block select-none"
                  style={{ pointerEvents: 'none' }}
                  alt="Widget Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
