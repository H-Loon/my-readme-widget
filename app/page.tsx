"use client";

import React, { useState, useEffect } from 'react';

// --- ICONS (Inline SVGs to avoid npm install dependencies) ---
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0 3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const LayoutIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
);
const PaletteIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);
const PlayIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
);
const FlaskIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>
);
const SlidersIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>
);
const CopyIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const CheckIcon = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function Home() {
  const [username, setUsername] = useState('Developer');
  const [tagline, setTagline] = useState('Building things for the web');
  const [theme, setTheme] = useState('blue');
  const [style, setStyle] = useState('ethereal');
  const [blobCount, setBlobCount] = useState(5);
  
  // Custom colors
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');

  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  // Set the origin (domain) only after component mounts on client
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const themes: any = {
    blue: { from: '#2563eb', to: '#06b6d4' },
    purple: { from: '#7c3aed', to: '#db2777' },
    green: { from: '#059669', to: '#84cc16' },
    orange: { from: '#ea580c', to: '#f59e0b' },
    custom: { from: customFrom, to: customTo }
  };

  // Construct the API URL dynamically based on current state
  const getApiUrl = () => {
    let url = `${origin}/api/badge?name=${encodeURIComponent(username)}&tagline=${encodeURIComponent(tagline)}&theme=${theme}&style=${style}`;
    if (style === 'ethereal') {
      url += `&blobs=${blobCount}`;
    }
    if (theme === 'custom') {
      url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
    }
    return url;
  };

  const markdownCode = `![My Widget](${getApiUrl()})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GithubIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Readme Widget Gen</h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            v2.0 Universal
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Section: Content */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <LayoutIcon size={16} /> Content
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tagline</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
              </div>
            </div>

            {/* Section: Style */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <PaletteIcon size={16} /> Appearance
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                
                {/* Style Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Template Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setStyle('modern')} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${style === 'modern' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>Modern</button>
                    <button onClick={() => setStyle('split')} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${style === 'split' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}><PlayIcon size={12}/> Split</button>
                    <button onClick={() => setStyle('ethereal')} className={`col-span-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${style === 'ethereal' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}><FlaskIcon size={12}/> Ethereal Liquid</button>
                  </div>
                </div>

                {/* Theme Colors */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Color Theme</label>
                  <div className="flex gap-3">
                    {Object.keys(themes).filter(t => t !== 'custom').map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-slate-900 ${theme === t ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                        style={{ background: `linear-gradient(135deg, ${themes[t].from}, ${themes[t].to})` }}
                        title={t}
                      />
                    ))}
                    <button
                      onClick={() => setTheme('custom')}
                      className={`w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-slate-900 flex items-center justify-center bg-slate-800 border border-slate-600 ${theme === 'custom' ? 'ring-2 ring-white text-white' : 'text-slate-400'}`}
                    >
                      <PaletteIcon size={14} />
                    </button>
                  </div>

                  {/* Custom Pickers */}
                  {theme === 'custom' && (
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                        <input type="color" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-6 h-6 rounded bg-transparent cursor-pointer border-none p-0"/>
                        <span className="text-[10px] font-mono text-slate-400">{customFrom}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                         <input type="color" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-6 h-6 rounded bg-transparent cursor-pointer border-none p-0"/>
                         <span className="text-[10px] font-mono text-slate-400">{customTo}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra Controls for Ethereal */}
                {style === 'ethereal' && (
                  <div className="pt-4 border-t border-slate-800">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-purple-400 flex items-center gap-1">
                          <SlidersIcon size={12}/> Shape Count
                        </label>
                        <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-purple-400 border border-purple-500/30">{blobCount}</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" value={blobCount} 
                        onChange={(e) => setBlobCount(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Preview */}
          <div className="lg:col-span-8 space-y-6">
             <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Live Preview</span>
                <span className="text-[10px] normal-case bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">System Operational</span>
              </h2>

            {/* Preview Window */}
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden relative group shadow-2xl shadow-black/50">
               {/* Grid Background Pattern to show transparency */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
               <div className="relative p-8 flex items-center justify-center min-h-[400px]">
                 {/* THIS IS THE REAL LIVE IMAGE FROM THE API */}
                 {origin && (
                   <img 
                      src={getApiUrl()} 
                      alt="Live Widget Preview" 
                      className="w-full max-w-4xl rounded-lg shadow-lg transition-all duration-500"
                   />
                 )}
                 {!origin && <div className="text-slate-500 animate-pulse">Connecting to API...</div>}
               </div>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
               <h3 className="text-white font-medium mb-4">Integration Code</h3>
               <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 bg-black rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-nowrap flex items-center">
                    {markdownCode}
                 </div>
                 <button 
                   onClick={handleCopy}
                   className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                 >
                   {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                   {copied ? 'Copied!' : 'Copy Markdown'}
                 </button>
               </div>
               <p className="mt-3 text-xs text-slate-500">
                 Paste this code directly into your GitHub <code>README.md</code> file.
               </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
