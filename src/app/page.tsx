'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { Icons } from '@/components/Icons';
import { NumberInput } from '@/components/NumberInput';

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false });

interface GradientStop {
  offset: number;
  color: string;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  text?: string;
  color?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'start' | 'middle' | 'end';
  fontFamily?: string;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  neon?: {
    enabled: boolean;
    color: string;
    intensity: number;
  };
  gradient?: {
    enabled: boolean;
    type: 'linear';
    angle: number;
    stops: GradientStop[];
  };
  src?: string;
  width?: number;
  height?: number;
  scale?: number;
  rotation?: number;
  fit?: 'contain' | 'cover' | 'stretch';
}

const Switch = ({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-9 h-5 rounded-full relative transition-colors border ${checked ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-700'}`}
  >
    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-4' : 'left-0.5'}`} />
  </button>
);

const GradientSlider = ({ stops, onChange }: { stops: GradientStop[]; onChange: (stops: GradientStop[]) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    const move = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let offset = (moveEvent.clientX - rect.left) / rect.width;
      offset = Math.max(0, Math.min(1, offset));
      const newStops = [...stops];
      newStops[index] = { ...newStops[index], offset };
      onChange(newStops.sort((a, b) => a.offset - b.offset));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div ref={containerRef} className="h-4 bg-slate-900 border border-slate-800 rounded-md relative cursor-pointer">
      <div
        className="absolute inset-0 rounded-md opacity-80"
        style={{
          background: `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
        }}
      />
      {stops.map((stop, i) => (
        <div
          key={i}
          onMouseDown={(e) => handleMouseDown(e, i)}
          className="absolute -top-1 w-6 h-6 -ml-3 bg-white border-2 border-slate-900 rounded-full cursor-ew-resize hover:scale-110 transition-transform shadow-lg z-10"
          style={{ left: `${stop.offset * 100}%` }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
    { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(1400);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [theme, setTheme] = useState('transparent');
  const [style, setStyle] = useState('transparent');
  const [blobCount, setBlobCount] = useState(5);
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');
  const [bgImage, setBgImage] = useState('');
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>('cover');
  const [showGrid, setShowGrid] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [widgetName, setWidgetName] = useState('Untitled Widget');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedWidgets, setSavedWidgets] = useState<any[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetch('https://api.fontsource.org/v1/fonts')
      .then(res => res.json())
      .then(data => {
        const fonts = data.map((f: any) => f.family);
        setGoogleFonts(fonts);
      })
      .catch(err => console.error('Failed to load fonts', err));
  }, []);

  // History State
  const [history, setHistory] = useState<CanvasElement[][]>([elements]);
  const [historyStep, setHistoryStep] = useState(0);

  const handleElementsChange = (newElements: CanvasElement[], saveHistory = true) => {
    setElements(newElements);
    if (saveHistory) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setElements(history[prevStep]);
      setHistoryStep(prevStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setElements(history[nextStep]);
      setHistoryStep(nextStep);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyStep]);

  const fetchWidgets = async (currentUser: any) => {
    if (!currentUser) {
      setSavedWidgets([]);
      return;
    }
    try {
      const q = query(collection(db, "widgets"), where("uid", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const widgets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      widgets.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSavedWidgets(widgets);
    } catch (e) {
      console.error("Error fetching widgets", e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      fetchWidgets(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const login = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Login failed. Check your Firebase config.");
    }
  };

  const logout = () => signOut(auth);

  const saveWidget = async () => {
    if (!user) return alert("Please log in to save.");
    try {
      const widgetData = {
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

      if (savedId) {
        await setDoc(doc(db, "widgets", savedId), widgetData, { merge: true });
        alert("Widget updated!");
        fetchWidgets(user);
      } else {
        const docRef = await addDoc(collection(db, "widgets"), widgetData);
        setSavedId(docRef.id);
        alert("Saved! Short link generated.");
        fetchWidgets(user);
      }
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Error saving. Check console.");
    }
  };

  const deleteWidget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this widget?")) return;
    try {
      await deleteDoc(doc(db, "widgets", id));
      setSavedWidgets(prev => prev.filter(w => w.id !== id));
      if (savedId === id) {
        setSavedId(null);
      }
    } catch (e) {
      console.error("Error deleting", e);
    }
  };

  const loadWidget = (widget: any) => {
    setElements(widget.elements || []);
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
    setSavedId(null);
    setWidgetName('Untitled Widget');
    setElements([
      { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
      { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowEnabled: false, shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
    ]);
    setTheme('transparent');
    setStyle('transparent');
    setBgImage('');
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    // Legacy handler - no longer needed with Konva but kept for reference or cleanup
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Legacy handler - no longer needed with Konva
  };

  const handleMouseUp = () => {
    // Legacy handler - no longer needed with Konva
  };

  const fitCanvasToContent = () => {
    if (elements.length > 0) {
      const lowestY = Math.max(...elements.map(e => e.y + (e.type === 'image' ? (e.height || 0) / 2 : 0)));
      setCanvasHeight(Math.max(600, Math.round(lowestY + 150)));
    }
  };

  const handleAlignChange = (newAlign: 'start' | 'middle' | 'end') => {
    if (!selectedId) return;

    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'text') {
        const width = el.width || (el.text?.length || 0) * (el.size || 16) * 0.6;
        const oldAlign = el.align || 'start';

        if (oldAlign === newAlign) return el;

        let visualLeft = el.x;
        if (oldAlign === 'middle') visualLeft = el.x - width / 2;
        if (oldAlign === 'end') visualLeft = el.x - width;

        let newX = visualLeft;
        if (newAlign === 'middle') newX = visualLeft + width / 2;
        if (newAlign === 'end') newX = visualLeft + width;

        return { ...el, align: newAlign, x: newX };
      }
      return el;
    }));
  };

  const addText = () => {
    const newId = Date.now().toString();
    setElements([...elements, {
      id: newId,
      type: 'text',
      text: "New Text",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      color: '#334155',
      size: 32,
      bold: false,
      italic: false,
      underline: false,
      align: 'middle',
      fontFamily: 'sans-serif',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] },
      neon: { enabled: false, color: '#00ff00', intensity: 20 }
    }]);
    setSelectedId(newId);
  };

  const resolveImageDimensions = (src: string, id: string) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 250;
      const ratio = img.width / img.height;
      let newW = img.width;
      let newH = img.height;

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
    // Ensure start position aligns with 20px grid (700 - 60 = 640, 300 + 60 = 360)
    const startX = (canvasWidth / 2) - 60;
    const startY = (canvasHeight / 2) + 60;
    const defaultSrc = "https://img.shields.io/badge/Badge-Example-blue";

    setElements([...elements, { id: newId, type: 'image', src: defaultSrc, x: startX, y: startY, width: 100, height: 100, scale: 1.0, fit: 'contain' }]);
    setSelectedId(newId);
    resolveImageDimensions(defaultSrc, newId);
  };

  const loadWebFont = (fontFamily: string) => {
    if (!fontFamily) return;
    const linkId = `font-${fontFamily.replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  const updateSelected = (key: keyof CanvasElement, value: any) => {
    let finalValue = value;
    // Auto-fix github-readme-stats URLs to ensure they work in Canvas
    if (key === 'src' && typeof value === 'string') {
      if (value.includes('github-readme-stats.vercel.app') && !value.includes('disable_animations')) {
        finalValue += value.includes('?') ? '&disable_animations=true' : '?disable_animations=true';
      }
    }

    if (key === 'fontFamily') {
      loadWebFont(value);
    }

    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [key]: finalValue } : el));
    if (key === 'src' && selectedId) {
      resolveImageDimensions(finalValue, selectedId);
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
          x: 0
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
          width: newWidth,
          height: newHeight,
          scale: newScale,
          y: 0
        };
      }
      return el;
    }));
  };

  const getApiUrl = (forcePreview = false) => {
    if (savedId && !forcePreview) {
      return `${origin}/api/badge?id=${savedId}`;
    }
    const minifiedElements = elements.map(({ id, scale, ...rest }) => rest);
    const jsonString = JSON.stringify(minifiedElements);
    let url = `${origin}/api/badge?data=${encodeURIComponent(jsonString)}&h=${canvasHeight}&w=${canvasWidth}&theme=${theme}&style=${style}`;
    if (style === 'ethereal') url += `&blobs=${blobCount}`;
    if (theme === 'custom') url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
    if (bgImage) url += `&bg=${encodeURIComponent(bgImage)}&bgFit=${bgFit}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icons.Github className="w-5 h-5 text-white" />
            </div>
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
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Widget Name"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(getApiUrl(true), '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              <Icons.Eye size={16} /> Preview
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getApiUrl());
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
          {savedWidgets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Widgets</h3>
              <div className="space-y-2">
                <button
                  onClick={createNew}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors text-xs font-medium"
                >
                  <Icons.Plus size={14} /> New Widget
                </button>
                {savedWidgets.map(w => (
                  <div
                    key={w.id}
                    onClick={() => loadWidget(w)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-md border transition-all cursor-pointer ${
                      savedId === w.id
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <span className={`text-xs font-medium truncate ${savedId === w.id ? 'text-blue-200' : 'text-slate-300'}`}>
                      {w.name}
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
                  value={canvasWidth}
                  onChange={(val) => setCanvasWidth(val)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Height</label>
                <NumberInput
                  value={canvasHeight}
                  onChange={(val) => setCanvasHeight(val)}
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
                    onClick={() => setTheme(t)}
                    className={`px-2 py-1.5 rounded text-xs font-medium capitalize border transition-all ${theme === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {theme === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">From</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5">
                    <input type="color" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0" />
                    <span className="text-xs text-slate-300 font-mono">{customFrom}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">To</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5">
                    <input type="color" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0" />
                    <span className="text-xs text-slate-300 font-mono">{customTo}</span>
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
                    onClick={() => setStyle(s)}
                    className={`px-2 py-1.5 rounded text-xs font-medium capitalize border transition-all ${style === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {style === 'ethereal' && (
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[11px] font-medium text-slate-400">Blob Count</label>
                  <span className="text-[10px] text-slate-500 font-mono">{blobCount}</span>
                </div>
                <input
                  type="range"
                  min="1" max="10"
                  value={blobCount}
                  onChange={(e) => setBlobCount(Number(e.target.value))}
                  className="w-full custom-range"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400">Background Image</label>
              <input
                type="text"
                value={bgImage}
                onChange={(e) => setBgImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
              />
              {bgImage && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setBgFit('cover')}
                    className={`flex-1 py-1.5 text-[10px] font-medium rounded border transition-all ${bgFit === 'cover' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => setBgFit('contain')}
                    className={`flex-1 py-1.5 text-[10px] font-medium rounded border transition-all ${bgFit === 'contain' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    Contain
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <label className="text-[11px] font-medium text-slate-400">Show Grid</label>
              <Switch checked={showGrid} onChange={setShowGrid} />
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
          {selectedId && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Element</h3>
                <button onClick={deleteSelected} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Icons.Trash size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">X</label>
                  <NumberInput
                    value={Math.round(elements.find(el => el.id === selectedId)?.x || 0)}
                    onChange={(val) => updateSelected('x', val)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Y</label>
                  <NumberInput
                    value={Math.round(elements.find(el => el.id === selectedId)?.y || 0)}
                    onChange={(val) => updateSelected('y', val)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {elements.find(el => el.id === selectedId)?.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Text Content</label>
                    <textarea
                      value={elements.find(el => el.id === selectedId)?.text || ''}
                      onChange={(e) => updateSelected('text', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none resize-y min-h-[80px] transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Font Size</label>
                        <NumberInput
                          value={elements.find(el => el.id === selectedId)?.size || 16}
                          onChange={(val) => updateSelected('size', val)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">Color</label>
                        <div className="flex items-center gap-2 h-[34px]">
                          <input
                            type="text"
                            value={elements.find(el => el.id === selectedId)?.color || '#000000'}
                            onChange={(e) => updateSelected('color', e.target.value)}
                            className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                          />
                          <input
                            type="color"
                            value={elements.find(el => el.id === selectedId)?.color || '#000000'}
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
                        onClick={() => setShowFontList(!showFontList)}
                      >
                        <span className="truncate">{elements.find(el => el.id === selectedId)?.fontFamily || 'sans-serif'}</span>
                        <Icons.Move size={12} className="rotate-90 text-slate-500" />
                      </div>
                      {showFontList && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-800 rounded-md shadow-xl z-50 custom-scrollbar">
                          <div className="p-2 sticky top-0 bg-slate-900 border-b border-slate-800">
                            <input
                              type="text"
                              value={fontSearch}
                              onChange={(e) => setFontSearch(e.target.value)}
                              placeholder="Search fonts..."
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                              autoFocus
                            />
                          </div>
                          {['sans-serif', 'serif', 'monospace', ...googleFonts]
                            .filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
                            .map(font => (
                              <div
                                key={font}
                                onClick={() => {
                                  updateSelected('fontFamily', font);
                                  setShowFontList(false);
                                  setFontSearch('');
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
                        onClick={() => updateSelected('bold', !elements.find(el => el.id === selectedId)?.bold)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.bold ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.Bold size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('italic', !elements.find(el => el.id === selectedId)?.italic)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.italic ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.Italic size={16} />
                      </button>
                      <button
                        onClick={() => updateSelected('underline', !elements.find(el => el.id === selectedId)?.underline)}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.underline ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.Underline size={16} />
                      </button>
                    </div>

                    <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleAlignChange('start')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.align === 'start' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.AlignLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('middle')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.align === 'middle' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.AlignCenter size={16} />
                      </button>
                      <button
                        onClick={() => handleAlignChange('end')}
                        className={`flex-1 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-center ${elements.find(el => el.id === selectedId)?.align === 'end' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                      >
                        <Icons.AlignRight size={16} />
                      </button>
                    </div>

                    {/* Shadow Controls */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-400">Shadow</label>
                        <Switch
                          checked={elements.find(el => el.id === selectedId)?.shadowEnabled || false}
                          onChange={(checked) => updateSelected('shadowEnabled', checked)}
                        />
                      </div>
                      {elements.find(el => el.id === selectedId)?.shadowEnabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Color</label>
                            <div className="flex items-center gap-2 h-[34px]">
                              <input
                                type="text"
                                value={elements.find(el => el.id === selectedId)?.shadowColor || '#000000'}
                                onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                              />
                              <input
                                type="color"
                                value={elements.find(el => el.id === selectedId)?.shadowColor || '#000000'}
                                onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Blur</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedId)?.shadowBlur || 0}
                              onChange={(val) => updateSelected('shadowBlur', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset X</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedId)?.shadowOffsetX || 0}
                              onChange={(val) => updateSelected('shadowOffsetX', val)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Offset Y</label>
                            <NumberInput
                              value={elements.find(el => el.id === selectedId)?.shadowOffsetY || 0}
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
                          checked={elements.find(el => el.id === selectedId)?.neon?.enabled || false}
                          onChange={(checked) => {
                            const el = elements.find(el => el.id === selectedId);
                            updateSelected('neon', { ...el?.neon, enabled: checked });
                          }}
                        />
                      </div>
                      {elements.find(el => el.id === selectedId)?.neon?.enabled && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Glow Color</label>
                            <div className="flex items-center gap-2 h-[34px]">
                              <input
                                type="text"
                                value={elements.find(el => el.id === selectedId)?.neon?.color || '#00ff00'}
                                onChange={(e) => {
                                  const el = elements.find(el => el.id === selectedId);
                                  updateSelected('neon', { ...el?.neon, color: e.target.value });
                                }}
                                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none uppercase transition-all"
                              />
                              <input
                                type="color"
                                value={elements.find(el => el.id === selectedId)?.neon?.color || '#00ff00'}
                                onChange={(e) => {
                                  const el = elements.find(el => el.id === selectedId);
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
                              min="1" max="100"
                              value={elements.find(el => el.id === selectedId)?.neon?.intensity || 20}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedId);
                                updateSelected('neon', { ...el?.neon, intensity: Number(e.target.value) });
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
                          checked={elements.find(el => el.id === selectedId)?.gradient?.enabled || false}
                          onChange={(checked) => {
                            const el = elements.find(el => el.id === selectedId);
                            updateSelected('gradient', { ...el?.gradient, enabled: checked });
                          }}
                        />
                      </div>
                      {elements.find(el => el.id === selectedId)?.gradient?.enabled && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-slate-400">Angle ({elements.find(el => el.id === selectedId)?.gradient?.angle}°)</label>
                            <input
                              type="range"
                              min="0" max="360"
                              value={elements.find(el => el.id === selectedId)?.gradient?.angle || 90}
                              onChange={(e) => {
                                const el = elements.find(el => el.id === selectedId);
                                updateSelected('gradient', { ...el?.gradient, angle: Number(e.target.value) });
                              }}
                              className="w-full custom-range"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Gradient Preview</label>
                            <GradientSlider
                              stops={elements.find(el => el.id === selectedId)?.gradient?.stops || []}
                              onChange={(newStops) => {
                                const el = elements.find(el => el.id === selectedId);
                                updateSelected('gradient', { ...el?.gradient, stops: newStops });
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400">Colors</label>
                            {elements.find(el => el.id === selectedId)?.gradient?.stops?.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={stop.color}
                                  onChange={(e) => {
                                    const el = elements.find(el => el.id === selectedId);
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
                                    const el = elements.find(el => el.id === selectedId);
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
                                const el = elements.find(el => el.id === selectedId);
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

              {elements.find(el => el.id === selectedId)?.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Image URL</label>
                    <input
                      type="text"
                      value={elements.find(el => el.id === selectedId)?.src || ''}
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
            width: `${canvasWidth * zoom + 64}px`,
            height: `${canvasHeight * zoom + 64}px`
          }}>
            <div style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}>
              <div className="relative shadow-2xl ring-1 ring-slate-800">
                <CanvasEditor
                  width={canvasWidth}
                  height={canvasHeight}
                  elements={elements}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onChange={handleElementsChange}
                  bgImage={bgImage}
                  bgFit={bgFit}
                  theme={theme}
                  customFrom={customFrom}
                  customTo={customTo}
                  blobCount={blobCount}
                  showGrid={showGrid}
                  style={style}
                />
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-800 z-10">
            <button
              onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <Icons.ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(5, z + 0.1))}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <Icons.ZoomIn size={16} />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <span className="text-xs text-slate-500 px-2">
              {Math.round(canvasWidth)} x {Math.round(canvasHeight)} px
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}