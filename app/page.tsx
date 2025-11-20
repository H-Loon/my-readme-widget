"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const Icons = {
  Github: ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0 3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
  Copy: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Bold: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Underline: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>,
  Move: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  Image: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Scale: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 10l7-7"/></svg>,
  Max: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  Fit: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
  ExternalLink: ({ size, className }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
};

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  text?: string;
  color?: string;
  size?: number;
  bold?: boolean;
  underline?: boolean;
  align?: 'start' | 'middle' | 'end';
  src?: string;
  width?: number;
  height?: number;
  scale?: number;
  fit?: 'contain' | 'cover' | 'stretch';
}

export default function Home() {
  const [theme, setTheme] = useState('blue');
  const [style, setStyle] = useState('ethereal');
  const [blobCount, setBlobCount] = useState(5);
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');
  const [bgImage, setBgImage] = useState('');
  const [canvasWidth, setCanvasWidth] = useState(1400);
  const [canvasHeight, setCanvasHeight] = useState(600);

  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle' },
    { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = canvasWidth / rect.width;
      const mouseX = (e.clientX - rect.left) * scale;
      const mouseY = (e.clientY - rect.top) * scale;
      const el = elements.find(e => e.id === id);
      if (el) {
        if (el.type === 'text') {
          dragOffset.current = { x: mouseX - el.x, y: mouseY - el.y };
        } else {
          dragOffset.current = { x: mouseX - el.x, y: mouseY - el.y };
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasWidth / rect.width;
    const mouseX = (e.clientX - rect.left) * scale;
    const mouseY = (e.clientY - rect.top) * scale;

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return { 
          ...el, 
          x: Math.round(mouseX - dragOffset.current.x), 
          y: Math.round(mouseY - dragOffset.current.y) 
        };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (elements.length > 0) {
       const lowestY = Math.max(...elements.map(e => e.y + (e.type === 'image' ? (e.height || 0)/2 : 0)));
       if (lowestY + 150 > canvasHeight) {
         setCanvasHeight(Math.round(lowestY + 150));
       }
    }
  };

  const fitCanvasToContent = () => {
    if (elements.length > 0) {
       const lowestY = Math.max(...elements.map(e => e.y + (e.type === 'image' ? (e.height || 0)/2 : 0)));
       setCanvasHeight(Math.max(600, Math.round(lowestY + 150)));
    }
  };

  const addText = () => {
    const newId = Date.now().toString();
    setElements([...elements, { id: newId, type: 'text', text: "New Text", x: canvasWidth / 2, y: canvasHeight / 2, color: '#334155', size: 32, bold: false, underline: false, align: 'middle' }]);
    setSelectedId(newId);
  };

  // FIX: Detect real dimensions when adding or updating images
  const resolveImageDimensions = (src: string, id: string) => {
    const img = new Image();
    img.onload = () => {
      // Default max width to prevent huge images exploding the canvas
      const maxW = 250; 
      const ratio = img.width / img.height;
      
      let newW = img.width;
      let newH = img.height;

      // Scale down if too huge initially
      if (newW > maxW) {
        newW = maxW;
        newH = maxW / ratio;
      }

      setElements(prev => prev.map(el => {
        if (el.id === id) {
          return { 
            ...el, 
            width: Math.round(newW), 
            height: Math.round(newH),
            scale: 1.0 
          };
        }
        return el;
      }));
    };
    img.src = src;
  };

  const addImage = () => {
    const newId = Date.now().toString();
    const startX = (canvasWidth / 2) - 50; 
    const startY = (canvasHeight / 2) + 50;
    const defaultSrc = "https://img.shields.io/badge/Badge-Example-blue";
    
    // Start with placeholders, then resolve
    setElements([...elements, { id: newId, type: 'image', src: defaultSrc, x: startX, y: startY, width: 100, height: 20, scale: 1.0, fit: 'contain' }]);
    setSelectedId(newId);
    resolveImageDimensions(defaultSrc, newId);
  };

  const updateSelected = (key: keyof CanvasElement, value: any) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
    
    // FIX: Resolve new dimensions if URL changes
    if (key === 'src' && selectedId) {
       resolveImageDimensions(value, selectedId);
    }
  };

  const updateScale = (newScale: number) => {
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'image') {
        const oldScale = el.scale || 1;
        const safeOldScale = oldScale === 0 ? 1 : oldScale;
        const ratio = newScale / safeOldScale;
        return {
          ...el,
          scale: newScale,
          width: Math.round(el.width! * ratio),
          height: Math.round(el.height! * ratio)
        };
      }
      return el;
    }));
  };

  const deleteSelected = () => {
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const fitToWidth = () => {
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'image') {
         const newWidth = canvasWidth;
         const ratio = newWidth / (el.width || 1);
         const newHeight = Math.round((el.height || 1) * ratio);
         const newScale = (el.scale || 1) * ratio;
         return { 
            ...el, 
            width: newWidth, 
            height: newHeight, 
            scale: newScale,
            x: 0 // Top-Left Align
         };
      }
      return el;
    }));
  };

  const fitToHeight = () => {
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'image') {
         const newHeight = canvasHeight;
         const ratio = newHeight / (el.height || 1);
         const newWidth = Math.round((el.width || 1) * ratio);
         const newScale = (el.scale || 1) * ratio;
         return { 
            ...el, 
            height: newHeight, 
            width: newWidth,
            scale: newScale,
            y: 0 // Top-Left Align
         };
      }
      return el;
    }));
  };

  const getApiUrl = () => {
    const minifiedElements = elements.map(({ id, scale, ...rest }) => rest);
    const jsonString = JSON.stringify(minifiedElements);
    let url = `${origin}/api/badge?data=${encodeURIComponent(jsonString)}&h=${canvasHeight}&w=${canvasWidth}&theme=${theme}&style=${style}`;
    if (style === 'ethereal') url += `&blobs=${blobCount}`;
    if (theme === 'custom') url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
    if (bgImage) url += `&bg=${encodeURIComponent(bgImage)}`;
    return url;
  };

  const handlePreview = () => {
    window.open(getApiUrl(), '_blank');
  };

  const handleCopy = async () => {
    const text = `![Widget](${getApiUrl()})`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (e) {
        console.error('Copy failed', e);
      }
      document.body.removeChild(textarea);
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30 flex flex-col" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md h-16 flex items-center px-6 justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg"><Icons.Github className="w-5 h-5 text-white" /></div>
          <h1 className="font-bold">Widget Canvas Editor</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 items-center text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">
             <span>Canvas:</span>
             <input type="number" value={canvasWidth} onChange={e => setCanvasWidth(parseInt(e.target.value))} className="w-12 bg-transparent text-white text-center outline-none border-b border-slate-700 focus:border-purple-500"/>
             <span>x</span>
             <input type="number" value={canvasHeight} onChange={e => setCanvasHeight(parseInt(e.target.value))} className="w-12 bg-transparent text-white text-center outline-none border-b border-slate-700 focus:border-purple-500"/>
             <button onClick={fitCanvasToContent} title="Auto-fit Height" className="hover:text-white text-slate-400"><Icons.Fit size={14}/></button>
          </div>
          
          <button onClick={handlePreview} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-all">
             <Icons.ExternalLink size={16} /> Preview
          </button>

          <button onClick={handleCopy} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />} {copied ? 'Copied!' : 'Get Code'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-40">
          <div className="space-y-4">
             <div className="flex items-center justify-between gap-2">
               <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Layers</h3>
               <div className="flex gap-1">
                <button onClick={addText} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-purple-400 flex items-center gap-1"><Icons.Plus size={10}/> Text</button>
                <button onClick={addImage} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-green-400 flex items-center gap-1"><Icons.Image size={10}/> Marker</button>
               </div>
             </div>
             
             {selectedElement ? (
               <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                 {selectedElement.type === 'text' && (
                   <>
                     <div>
                       <label className="text-[10px] text-slate-500 uppercase block mb-1">Content</label>
                       <textarea value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"/>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[10px] text-slate-500 uppercase block mb-1">Size</label>
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
                     <div className="flex gap-2">
                       <button onClick={() => updateSelected('bold', !selectedElement.bold)} className={`flex-1 py-2 rounded border flex items-center justify-center ${selectedElement.bold ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><Icons.Bold size={16}/></button>
                       <button onClick={() => updateSelected('underline', !selectedElement.underline)} className={`flex-1 py-2 rounded border flex items-center justify-center ${selectedElement.underline ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><Icons.Underline size={16}/></button>
                     </div>
                   </>
                 )}

                 {selectedElement.type === 'image' && (
                   <>
                    <div>
                       <label className="text-[10px] text-slate-500 uppercase block mb-1">Image/Marker URL</label>
                       <input type="text" value={selectedElement.src} onChange={(e) => updateSelected('src', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-green-500 outline-none"/>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Icons.Scale size={10}/> Scale (Multipler)</label>
                          <span className="text-[10px] font-mono text-green-400">{selectedElement.scale?.toFixed(1)}x</span>
                       </div>
                       <div className="flex gap-2 items-center">
                          <input 
                            type="range" min="0.1" max="15" step="0.1" value={selectedElement.scale || 1} 
                            onChange={(e) => updateScale(parseFloat(e.target.value))} 
                            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                          <input 
                            type="number" step="0.1" min="0.1" max="15" value={selectedElement.scale || 1} 
                            onChange={(e) => updateScale(parseFloat(e.target.value))} 
                            className="w-12 bg-slate-900 border border-slate-800 rounded p-1 text-xs text-center focus:ring-1 focus:ring-green-500 outline-none"
                          />
                       </div>
                    </div>
                    
                    {/* READ-ONLY DIMENSIONS */}
                    <div>
                       <label className="text-[10px] text-slate-500 uppercase block mb-1">Dimensions (Px)</label>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 opacity-50 cursor-not-allowed">
                             <span className="text-[10px] text-slate-500 mr-1">W:</span>
                             <input 
                               type="number" 
                               readOnly
                               value={selectedElement.width} 
                               className="w-full bg-transparent text-xs text-slate-400 py-1 outline-none cursor-not-allowed"
                             />
                          </div>
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 opacity-50 cursor-not-allowed">
                             <span className="text-[10px] text-slate-500 mr-1">H:</span>
                             <input 
                               type="number" 
                               readOnly
                               value={selectedElement.height} 
                               className="w-full bg-transparent text-xs text-slate-400 py-1 outline-none cursor-not-allowed"
                             />
                          </div>
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-slate-500 uppercase block">Fit Mode</label>
                          <div className="flex gap-1">
                            <button onClick={fitToWidth} className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-green-400 hover:bg-slate-700 flex items-center gap-0.5" title="Fit to Width Prop"><Icons.Max size={8}/> W</button>
                            <button onClick={fitToHeight} className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-green-400 hover:bg-slate-700 flex items-center gap-0.5" title="Fit to Height Prop"><Icons.Max size={8}/> H</button>
                          </div>
                       </div>
                       <div className="flex bg-slate-900 rounded border border-slate-800 p-1 gap-1">
                         {['contain', 'cover', 'stretch'].map((mode) => (
                           <button key={mode} onClick={() => updateSelected('fit', mode)} className={`flex-1 text-[10px] py-1.5 rounded capitalize ${selectedElement.fit === mode || (!selectedElement.fit && mode === 'contain') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}>{mode}</button>
                         ))}
                       </div>
                    </div>
                   </>
                 )}

                 <button onClick={deleteSelected} className="w-full py-2 rounded border border-red-900/50 bg-red-900/10 text-red-400 hover:bg-red-900/30 flex items-center justify-center"><Icons.Trash size={16}/></button>
               </div>
             ) : <div className="h-32 flex items-center justify-center text-slate-600 text-sm italic border border-dashed border-slate-800 rounded-xl">Select an item</div>}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
             <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Global Settings</h3>
             <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Custom Background URL</label>
                <input type="text" value={bgImage} onChange={(e) => setBgImage(e.target.value)} placeholder="https://example.com/my-bg.gif" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"/>
             </div>
             {!bgImage && (
               <>
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
               </>
             )}
          </div>
        </div>

        <div className="flex-1 bg-black relative overflow-auto flex justify-center p-10 cursor-grab active:cursor-grabbing">
           <div 
              ref={canvasRef}
              className="bg-slate-900 shadow-2xl relative transition-all duration-300 ease-out origin-top flex-shrink-0"
              style={{ 
                width: '1000px', 
                height: `${(canvasHeight / canvasWidth) * 1000}px`, 
                backgroundImage: bgImage ? `url(${bgImage})` : 'radial-gradient(#1e293b 1px, transparent 1px)', 
                backgroundSize: bgImage ? 'cover' : '20px 20px',
                backgroundPosition: 'center',
                boxShadow: '0 0 100px rgba(0,0,0,0.5)'
              }}
           >
              {!bgImage && (
                <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
                   <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[60px] opacity-60" style={{ background: theme === 'custom' ? customFrom : 'blue' }}></div>
                   <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[60px] opacity-60" style={{ background: theme === 'custom' ? customTo : 'purple' }}></div>
                </div>
              )}

              {elements.map(el => (
                 <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    className={`absolute whitespace-nowrap select-none group hover:scale-[1.01] transition-transform ${selectedId === el.id ? 'z-50' : 'z-10'}`}
                    style={{
                       left: `${(el.x / canvasWidth) * 100}%`,
                       top: `${(el.y / canvasHeight) * 100}%`,
                       
                       transform: el.type === 'text' ? 'translate(-50%, -50%)' : 'none',
                       
                       color: el.color,
                       fontSize: el.type === 'text' ? `${((el.size || 24) / canvasWidth) * 1000}px` : undefined,
                       fontWeight: el.bold ? 'bold' : 'normal',
                       textDecoration: el.underline ? 'underline' : 'none',
                       fontFamily: 'system-ui, sans-serif',
                       cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                 >
                    {el.type === 'text' ? el.text : (
                      <img 
                        src={el.src} 
                        alt="marker" 
                        className="max-w-none" 
                        style={{ 
                          width: `${((el.width || 100) / canvasWidth) * 1000}px`,
                          height: `${((el.height || 20) / canvasWidth) * 1000}px`,
                          objectFit: (el.fit === 'stretch' ? 'fill' : (el.fit || 'contain'))
                        }} 
                      />
                    )}
                    
                    {selectedId === el.id && (
                       <div className="absolute -inset-3 border-2 border-dashed border-purple-500 rounded opacity-50 pointer-events-none animate-pulse">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-2 rounded py-0.5 whitespace-nowrap">
                             <Icons.Move size={10} className="inline mr-1"/> Drag
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
