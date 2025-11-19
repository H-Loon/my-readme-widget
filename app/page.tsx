"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Github, Check, Sliders, Palette, FlaskConical, PlayCircle, Layout } from 'lucide-react';

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
              <Github className="w-5 h-5 text-white" />
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
                <Layout size={16} /> Content
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
                <Palette size={16} /> Appearance
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                
                {/* Style Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Template Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setStyle('modern')} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${style === 'modern' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>Modern</button>
                    <button onClick={() => setStyle('split')} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${style === 'split' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}><PlayCircle size={12}/> Split</button>
                    <button onClick={() => setStyle('ethereal')} className={`col-span-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${style === 'ethereal' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}><FlaskConical size={12}/> Ethereal Liquid</button>
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
                      <Palette size={14} />
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
                          <Sliders size={12}/> Shape Count
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
                   {copied ? <Check size={18} /> : <Copy size={18} />}
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
