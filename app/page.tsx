"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const Icons = {
  Github: ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0 3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
  Copy: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Bold: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Underline: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>,
  Move: ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
};

// --- TYPES ---
interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  bold: boolean;
  underline: boolean;
  align: 'start' | 'middle' | 'end';
}

export default function Home() {
  // Configuration State
  const [theme, setTheme] = useState('blue');
  const [style, setStyle] = useState('ethereal');
  const [blobCount, setBlobCount] = useState(5);
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');

  // Canvas State
  const [elements, setElements] = useState<TextElement[]>([
    { id: '1', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle' },
    { id: '2', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [canvasHeight, setCanvasHeight] = useState(600);
  
  // Internal Logic State
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Automatically calculate height based on lowest element
  useEffect(() => {
    if (elements.length === 0) return;
    const lowestY = Math.max(...elements.map(e => e.y));
    // Ensure minimum 600px, otherwise expand with 150px padding
    const newHeight = Math.max(600, lowestY + 150);
    if (newHeight !== canvasHeight) setCanvasHeight(newHeight);
  }, [elements]);

  // --- DRAG & DROP LOGIC ---
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    const el = elements.find(el => el.id === id);
    if (el && canvasRef.current) {
       // Calculate offset based on mouse click relative to element center (approx)
       // Since we use SVG coord system (1400 wide), we need to scale mouse movements
       // But for simplicity in this view, we'll just track visual delta
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate scale factor (Canvas is 1400 wide internally, but rendered smaller)
    const scale = 1400 / rect.width;
    
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return { ...el, x: Math.round(x), y: Math.round(y) };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- ELEMENT MANAGEMENT ---
  const addText = () => {
    const newId = Date.now().toString();
    setElements([...elements, {
      id: newId,
      text: "New Text Layer",
      x: 700, // Center
      y: 300,
      color: '#334155',
      size: 24,
      bold: false,
      underline: false,
      align: 'middle'
    }]);
    setSelectedId(newId);
  };

  const updateSelected = (key: keyof TextElement, value: any) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  };

  const deleteSelected = () => {
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  // --- URL GENERATION ---
  const getApiUrl = () => {
    // We serialize the elements array into a JSON string
    // We filter out 'id' to save URL space
    const minifiedElements = elements.map(({ id, ...rest }) => rest);
    const jsonString = JSON.stringify(minifiedElements);
    
    let url = `${origin}/api/badge?data=${encodeURIComponent(jsonString)}&h=${canvasHeight}&theme=${theme}&style=${style}`;
    
    if (style === 'ethereal') url += `&blobs=${blobCount}`;
    if (theme === 'custom') url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
    
    return url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`![Widget](${getApiUrl()})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30 flex flex-col" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md h-16 flex items-center px-6 justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg"><Icons.Github className="w-5 h-5 text-white" /></div>
          <h1 className="font-bold">Widget Canvas Editor</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">Canvas: 1400 x {canvasHeight}</div>
          <button onClick={handleCopy} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />} {copied ? 'Copied!' : 'Get Code'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-40">
          
          {/* Element Editor */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Selected Layer</h3>
               <button onClick={addText} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-purple-400 flex items-center gap-1"><Icons.Plus size={12}/> Add Text</button>
             </div>
             
             {selectedElement ? (
               <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                 {/* Text Content */}
                 <div>
                   <label className="text-[10px] text-slate-500 uppercase block mb-1">Content</label>
                   <textarea 
                      value={selectedElement.text}
                      onChange={(e) => updateSelected('text', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
                   />
                 </div>

                 {/* Typography Tools */}
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="text-[10px] text-slate-500 uppercase block mb-1">Size ({selectedElement.size}px)</label>
                       <input type="range" min="12" max="120" value={selectedElement.size} onChange={(e) => updateSelected('size', parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                    </div>
                    <div>
                       <label className="text-[10px] text-slate-500 uppercase block mb-1">Color</label>
                       <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                          <input type="color" value={selectedElement.color} onChange={(e) => updateSelected('color', e.target.value)} className="w-6 h-6 rounded bg-transparent cursor-pointer border-none p-0"/>
                          <span className="text-[10px] font-mono text-slate-400">{selectedElement.color}</span>
                       </div>
                    </div>
                 </div>

                 {/* Toggles */}
                 <div className="flex gap-2">
                   <button onClick={() => updateSelected('bold', !selectedElement.bold)} className={`flex-1 py-2 rounded border flex items-center justify-center ${selectedElement.bold ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><Icons.Bold size={16}/></button>
                   <button onClick={() => updateSelected('underline', !selectedElement.underline)} className={`flex-1 py-2 rounded border flex items-center justify-center ${selectedElement.underline ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><Icons.Underline size={16}/></button>
                   <button onClick={deleteSelected} className="flex-1 py-2 rounded border border-red-900/50 bg-red-900/10 text-red-400 hover:bg-red-900/30 flex items-center justify-center"><Icons.Trash size={16}/></button>
                 </div>

                 <div className="text-[10px] text-slate-600 text-center pt-2 border-t border-slate-800">
                   Drag text on canvas to move
                 </div>
               </div>
             ) : (
               <div className="h-32 flex items-center justify-center text-slate-600 text-sm italic border border-dashed border-slate-800 rounded-xl">
                 Select an item on canvas
               </div>
             )}
          </div>

          {/* Global Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
             <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Global Settings</h3>
             
             <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-2">Theme</label>
                <div className="flex gap-2 flex-wrap">
                   {['blue', 'purple', 'green', 'orange', 'custom'].map(t => (
                      <button key={t} onClick={() => setTheme(t)} className={`w-6 h-6 rounded-full border ${theme === t ? 'border-white scale-110' : 'border-transparent opacity-50'}`} style={{background: t === 'custom' ? '#fff' : `var(--color-${t})`, backgroundColor: t==='custom'?'white':(t==='blue'?'#2563eb':t==='purple'?'#7c3aed':t==='green'?'#059669':'#ea580c')}} />
                   ))}
                </div>
             </div>

             {theme === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                   <input type="color" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer"/>
                   <input type="color" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer"/>
                </div>
             )}
             
             <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-2">Animation Blobs: {blobCount}</label>
                <input type="range" min="1" max="10" value={blobCount} onChange={(e) => setBlobCount(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
             </div>
          </div>
        </div>

        {/* CANVAS AREA */}
        <div className="flex-1 bg-black relative overflow-auto flex justify-center p-10 cursor-grab active:cursor-grabbing">
           {/* The Visible Canvas Container */}
           <div 
              ref={canvasRef}
              className="bg-slate-900 shadow-2xl relative transition-all duration-300 ease-out origin-top"
              style={{ 
                width: '1000px', // Visual width (scaled down from 1400 logic)
                height: `${(canvasHeight / 1400) * 1000}px`, // Aspect ratio maintained
                backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', 
                backgroundSize: '20px 20px',
                boxShadow: '0 0 100px rgba(0,0,0,0.5)'
              }}
           >
              {/* Background Preview (Simplified for performance) */}
              <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
                 {/* Static representation of the gradient blobs for context */}
                 <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[60px] opacity-60" style={{ background: theme === 'custom' ? customFrom : 'blue' }}></div>
                 <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[60px] opacity-60" style={{ background: theme === 'custom' ? customTo : 'purple' }}></div>
              </div>

              {/* Text Elements Layer */}
              {elements.map(el => (
                 <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    className={`absolute whitespace-nowrap select-none group hover:scale-[1.01] transition-transform ${selectedId === el.id ? 'z-50' : 'z-10'}`}
                    style={{
                       left: `${(el.x / 1400) * 100}%`,
                       top: `${(el.y / canvasHeight) * 100}%`,
                       transform: 'translate(-50%, -50%)', // Center pivot
                       color: el.color,
                       fontSize: `${(el.size / 1400) * 1000}px`, // Scale font visually
                       fontWeight: el.bold ? 'bold' : 'normal',
                       textDecoration: el.underline ? 'underline' : 'none',
                       fontFamily: 'system-ui, sans-serif',
                       cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                 >
                    {el.text}
                    {/* Selection Ring */}
                    {selectedId === el.id && (
                       <div className="absolute -inset-3 border-2 border-dashed border-purple-500 rounded opacity-50 pointer-events-none animate-pulse">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-2 rounded py-0.5 whitespace-nowrap">
                             <Icons.Move size={10} className="inline mr-1"/> Drag to Move
                          </div>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
}
