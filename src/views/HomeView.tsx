/**
 * HomeView Component
 * 
 * This is the main presentation component for the application.
 * It implements the UI layout including:
 * - Header: Navigation, Auth controls, Save/Preview actions.
 * - Sidebar: Widget management, Canvas settings, Element properties.
 * - Main Area: The interactive CanvasEditor and Zoom controls.
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
  handleElementsChange: (elements: CanvasElement[]) => void;
  undo: () => void;
  redo: () => void;
  addText: () => void;
  addImage: () => void;
  updateSelected: (key: keyof CanvasElement, value: any) => void;
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
  getUrl
}: HomeViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20" />
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Readme Widget
            </span>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-slate-800">
              <button
                onClick={undo}
                disabled={historyStep === 0}
                className="p-2 hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Icons.Undo size={18} />
              </button>
              <button
                onClick={redo}
                disabled={historyStep === history.length - 1}
                className="p-2 hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
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
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(getUrl(true), '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              <Icons.Eye size={16} /> Preview
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getUrl());
                alert("Copied to clipboard!");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              <Icons.Copy size={16} /> Copy URL
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
        {/* Sidebar */}
        <aside className="w-80 bg-slate-900/50 border-r border-slate-800 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 space-y-6">

          {/* Saved Widgets */}
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
                    <button
                      onClick={(e) => deleteWidget(w.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Icons.Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canvas Settings</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Width</label>
                <NumberInput
                  value={editorState.canvasWidth}
                  onChange={(val) => editorState.setCanvasWidth(val)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Height</label>
                <NumberInput
                  value={editorState.canvasHeight}
                  onChange={(val) => editorState.setCanvasHeight(val)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button onClick={fitCanvasToContent} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md text-xs font-medium transition-colors">
              <Icons.Fit size={14} /> Fit to Content
            </button>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400">Theme Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {['transparent', 'custom'].map(t => (
                  <button
                    key={t}
                    onClick={() => editorState.setTheme(t)}
                    className={`px-2 py-1.5 rounded text-xs font-medium capitalize border transition-all ${editorState.theme === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {editorState.theme === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">From</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5">
                    <input type="color" value={editorState.customFrom} onChange={(e) => editorState.setCustomFrom(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0" />
                    <span className="text-xs text-slate-300 font-mono">{editorState.customFrom}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">To</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5">
                    <input type="color" value={editorState.customTo} onChange={(e) => editorState.setCustomTo(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0" />
                    <span className="text-xs text-slate-300 font-mono">{editorState.customTo}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400">Background Style</label>
              <div className="grid grid-cols-2 gap-2">
                {['transparent', 'ethereal'].map(s => (
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

            {editorState.style === 'ethereal' && (
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[11px] font-medium text-slate-400">Blob Count</label>
                  <span className="text-[10px] text-slate-500 font-mono">{editorState.blobCount}</span>
                </div>
                <input
                  type="range"
                  min="1" max="10"
                  value={editorState.blobCount}
                  onChange={(e) => editorState.setBlobCount(Number(e.target.value))}
                  className="w-full custom-range"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400">Background Image</label>
              <input
                type="text"
                value={editorState.bgImage}
                onChange={(e) => editorState.setBgImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <label className="text-[11px] font-medium text-slate-400">Show Grid</label>
              <Switch checked={editorState.showGrid} onChange={editorState.setShowGrid} />
            </div>
          </div>

          {/* Elements */}
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

          {/* Selected Element Properties */}
          {selectedIds.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedIds.length > 1 ? `${selectedIds.length} Elements Selected` : 'Selected Element'}
                </h3>
                <button onClick={deleteSelected} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Icons.Trash size={16} />
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
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Y</label>
                  <NumberInput
                    value={Math.round(elements.find(el => el.id === selectedIds[0])?.y || 0)}
                    onChange={(val) => updateSelected('y', val)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {elements.find(el => el.id === selectedIds[0])?.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Text Content</label>
                    <textarea
                      value={elements.find(el => el.id === selectedIds[0])?.text || ''}
                      onChange={(e) => updateSelected('text', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none resize-y min-h-[80px] transition-all"
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
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Letter Spacing</label>
                        <NumberInput
                          value={elements.find(el => el.id === selectedIds[0])?.letterSpacing || 0}
                          onChange={(val) => updateSelected('letterSpacing', val)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
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
                          />
                          <input
                            type="color"
                            value={(elements.find(el => el.id === selectedIds[0])?.color || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.color : '#000000'}
                            onChange={(e) => updateSelected('color', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                          />
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
                      >
                        <Icons.Bold size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('italic', !elements.find(el => el.id === selectedIds[0])?.italic)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.italic ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.Italic size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('underline', !elements.find(el => el.id === selectedIds[0])?.underline)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.underline ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.Underline size={16} />
                      </button>
                    </div>

                    <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleAlignChange('start')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'start' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.AlignLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('middle')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'middle' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.AlignCenter size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('end')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedIds[0])?.align === 'end' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
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
                              />
                              <input
                                type="color"
                                value={(elements.find(el => el.id === selectedIds[0])?.shadowColor || '#000000').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.shadowColor : '#000000'}
                                onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Blur</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowBlur || 0}
                              onChange={(val) => updateSelected('shadowBlur', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset X</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowOffsetX || 0}
                              onChange={(val) => updateSelected('shadowOffsetX', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset Y</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedIds[0])?.shadowOffsetY || 0}
                              onChange={(val) => updateSelected('shadowOffsetY', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
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
                              />
                              <input
                                type="color"
                                value={(elements.find(el => el.id === selectedIds[0])?.neon?.color || '#00ff00').startsWith('#') ? elements.find(el => el.id === selectedIds[0])?.neon?.color : '#00ff00'}
                                onChange={(e) => {
                                  const el = elements.find(el => el.id === selectedIds[0]);
                                  updateSelected('neon', { ...el?.neon, color: e.target.value });
                                }}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                              />
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
                                updateSelected('neon', { ...el?.neon, intensity: Number(e.target.value) });
                              }}
                              className="w-full custom-range"
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
                                updateSelected('neon', { ...el?.neon, propagation: Number(e.target.value) });
                              }}
                              className="w-full custom-range"
                            />
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
                        />
                      </div>
                      {elements.find(el => el.id === selectedIds[0])?.gradient?.enabled && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Angle ({elements.find(el => el.id === selectedIds[0])?.gradient?.angle}°)</label>
                            <input
                              type="range"
                              min="0" max="360"
                              value={elements.find(el => el.id === selectedIds[0])?.gradient?.angle || 90}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('gradient', { ...el?.gradient, angle: Number(e.target.value) });
                              }}
                              className="w-full custom-range"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Gradient Preview</label>
                            <GradientSlider
                              stops={elements.find(el => el.id === selectedIds[0])?.gradient?.stops || []}
                              onChange={(newStops) => {
                                const el = elements.find(el => el.id === selectedIds[0]);
                                updateSelected('gradient', { ...el?.gradient, stops: newStops });
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Colors</label>
                            {elements.find(el => el.id === selectedIds[0])?.gradient?.stops?.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={stop.color.startsWith('#') ? stop.color : '#000000'}
                                  onChange={(e) => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    const newStops = [...(el?.gradient?.stops || [])];
                                    newStops[idx] = { ...newStops[idx], color: e.target.value };
                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                  }}
                                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-xs font-mono text-slate-400 flex-1">{stop.color}</span>
                                <span className="text-xs text-slate-500 w-12 text-right">{Math.round(stop.offset * 100)}%</span>
                                <button
                                  onClick={() => {
                                    const el = elements.find(el => el.id === selectedIds[0]);
                                    const newStops = (el?.gradient?.stops || []).filter((_, i) => i !== idx);
                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                  }}
                                  className="text-slate-600 hover:text-red-400"
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

              {elements.find(el => el.id === selectedIds[0])?.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Image URL</label>
                    <input
                      type="text"
                      value={elements.find(el => el.id === selectedIds[0])?.src || ''}
                      onChange={(e) => updateSelected('src', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={fitToWidth} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md transition-all text-xs font-medium">
                      <Icons.Max size={14} /> Fit Width
                    </button>
                    <button onClick={fitToHeight} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-md transition-all text-xs font-medium">
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
                />
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-800 z-10">
            <button
              onClick={() => editorState.setZoom((z: number) => Math.max(0.1, z - 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <Icons.ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(editorState.zoom * 100)}%
            </span>
            <button
              onClick={() => editorState.setZoom((z: number) => Math.min(5, z + 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <Icons.ZoomIn size={16} />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <span className="text-xs text-slate-500 px-2">
              {Math.round(editorState.canvasWidth)} x {Math.round(editorState.canvasHeight)} px
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
