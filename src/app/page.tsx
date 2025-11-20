"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false });

// --- ICONS ---
const Icons = {
  Github: ({ className }: { className?: string }) => <svg suppressHydrationWarning viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0 3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
  Copy: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Bold: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Italic: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  Underline: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>,
  Move: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  Image: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Scale: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 10l7-7"/></svg>,
  Max: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  Fit: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
  ExternalLink: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Save: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  User: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Pencil: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Undo: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  Redo: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>,
  Swap: ({ size, className }: { size?: number; className?: string }) => <svg suppressHydrationWarning width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
};

const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
      focus-visible:ring-blue-600 focus-visible:ring-offset-2 
      ${checked ? 'bg-blue-600' : 'bg-slate-700'}
    `}
  >
    <span
      aria-hidden="true"
      className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-4' : 'translate-x-0'}
      `}
    />
  </button>
);

interface GradientStop {
  offset: number;
  color: string;
}

const GradientSlider = ({ stops, onChange }: { stops: GradientStop[]; onChange: (stops: GradientStop[]) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      
      const newStops = [...stops];
      newStops[index] = { ...newStops[index], offset: percentage };
      onChange(newStops);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Create a sorted version for the background preview
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
  const gradient = `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`;

  return (
    <div className="relative h-8 flex items-center select-none cursor-pointer" ref={containerRef}>
      <div 
        className="absolute inset-x-0 h-3 rounded-full ring-1 ring-slate-700"
        style={{ background: gradient }}
        onMouseDown={(e) => {
           // Optional: Click to add stop logic could go here
        }}
      />
      {stops.map((stop, idx) => (
        <div
          key={idx}
          onMouseDown={(e) => handleMouseDown(e, idx)}
          className="absolute w-5 h-5 -ml-2.5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
          style={{ 
            left: `${stop.offset * 100}%`, 
            backgroundColor: stop.color 
          }}
        />
      ))}
    </div>
  );
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
  italic?: boolean;
  underline?: boolean;
  align?: 'start' | 'middle' | 'end';
  fontFamily?: string;
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

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  
  const [theme, setTheme] = useState('blue');
  const [style, setStyle] = useState('ethereal');
  const [blobCount, setBlobCount] = useState(5);
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');
  const [bgImage, setBgImage] = useState('');
  const [bgFit, setBgFit] = useState<'cover' | 'contain' | 'stretch'>('cover');
  const [canvasWidth, setCanvasWidth] = useState(1400);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [widgetName, setWidgetName] = useState('Untitled Widget');

  const [savedWidgets, setSavedWidgets] = useState<any[]>([]);

  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
    { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontList, setShowFontList] = useState(false);
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);

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
        { id: '1', type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, color: '#334155', size: 48, bold: true, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
        { id: '2', type: 'text', text: "Building things for the web", x: 700, y: 260, color: '#64748b', size: 24, bold: false, underline: false, align: 'middle', fontFamily: 'sans-serif', shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 0, shadowColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] }, neon: { enabled: false, color: '#00ff00', intensity: 20 } },
      ]);
      setTheme('blue');
      setStyle('ethereal');
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
       const lowestY = Math.max(...elements.map(e => e.y + (e.type === 'image' ? (e.height || 0)/2 : 0)));
       setCanvasHeight(Math.max(600, Math.round(lowestY + 150)));
    }
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
      shadowColor: 'transparent',
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
    const startX = (canvasWidth / 2) - 50; 
    const startY = (canvasHeight / 2) + 50;
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
            height: newHeight, 
            width: newWidth,
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
             
             <div className="h-6 w-px bg-slate-800" />

             <div className="w-48 relative group">
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-300 placeholder-slate-600 truncate pr-6"
                  placeholder="Widget Name"
                />
                <Icons.Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-slate-300 transition-colors pointer-events-none" />
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Create new widget? Unsaved changes will be lost.")) {
                  createNew();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all border border-slate-700"
            >
              <Icons.Plus size={16} />
              New
            </button>

            {user ? (
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-5 h-5 rounded-full" />
                    ) : (
                        <Icons.User size={16} className="text-slate-400" />
                    )}
                    <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate">{user.displayName}</span>
                    <div className="w-px h-3 bg-slate-700 mx-1"></div>
                    <button
                        onClick={logout}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Sign Out
                    </button>
                  </div>
                  <button
                    onClick={saveWidget}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Icons.Save size={16} />
                    Save
                  </button>
               </div>
            ) : (
               <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all border border-slate-700"
               >
                 <Icons.User size={16} />
                 Sign In to Save
               </button>
            )}
            
            <div className="h-6 w-px bg-slate-800 mx-2" />

            <button
              disabled={!user}
              title={!user ? "Sign in to copy markdown" : "Copy Markdown"}
              onClick={() => {
                if (!user) return;
                const url = getApiUrl();
                const markdown = `![Widget](${url})`;
                navigator.clipboard.writeText(markdown);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-lg ${
                !user 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
            >
              {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>
            
            <a
              href={getApiUrl(true)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all border border-slate-700"
            >
              <Icons.ExternalLink size={16} />
              Preview
            </a>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Saved Widgets List */}
          {user && savedWidgets.length > 0 && (
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Widgets</h3>
                <div className="space-y-1">
                    {savedWidgets.map(w => (
                        <div key={w.id} className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${savedId === w.id ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                            <span className="text-sm truncate flex-1" onClick={() => loadWidget(w)}>{w.name || 'Untitled'}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteWidget(w.id, e); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity">
                                <Icons.Trash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Theme & Style */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appearance</h3>
            
            <div className="grid grid-cols-2 gap-2">
                {['blue', 'purple', 'green', 'orange', 'custom'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-all border ${theme === t ? 'bg-slate-800 border-blue-500 text-white shadow-sm' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {theme === 'custom' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500">From</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
                            <span className="text-xs font-mono text-slate-400">{customFrom}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500">To</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
                            <span className="text-xs font-mono text-slate-400">{customTo}</span>
                        </div>
                    </div>
                </div>
            )}

            {style === 'ethereal' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-500">Blob Count</label>
                        <span className="text-xs text-slate-400">{blobCount}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={blobCount} 
                        onChange={(e) => setBlobCount(Number(e.target.value))}
                        className="w-full custom-range"
                    />
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs text-slate-500">Background Image URL</label>
                <input 
                    type="text" 
                    value={bgImage} 
                    onChange={(e) => setBgImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
                {bgImage && (
                    <div className="flex gap-2 mt-2">
                        {['cover', 'contain', 'stretch'].map((fit) => (
                            <button
                                key={fit}
                                onClick={() => setBgFit(fit as any)}
                                className={`flex-1 py-1 text-xs rounded border capitalize ${bgFit === fit ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                {fit}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canvas Size</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Width</label>
                    <input 
                        type="number" 
                        value={canvasWidth} 
                        onChange={(e) => setCanvasWidth(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Height</label>
                    <input 
                        type="number" 
                        value={canvasHeight} 
                        onChange={(e) => setCanvasHeight(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>
          </div>

          {/* Elements */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={addText} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 hover:border-slate-600">
                    <Icons.Plus size={16} />
                    <span className="text-sm font-medium">Add Text</span>
                </button>
                <button onClick={addImage} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 hover:border-slate-600">
                    <Icons.Plus size={16} />
                    <span className="text-sm font-medium">Add Image / MD</span>
                </button>
            </div>
          </div>

          {/* Selected Element Properties */}
          {selectedId && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-left-4 duration-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Selected Element</h3>
                    <button onClick={deleteSelected} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors">
                        <Icons.Trash size={14} />
                    </button>
                </div>

                {elements.find(el => el.id === selectedId)?.type === 'text' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500">Content</label>
                            <textarea 
                                value={elements.find(el => el.id === selectedId)?.text || ''}
                                onChange={(e) => updateSelected('text', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none min-h-[80px] resize-y"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-xs text-slate-500">Font Family</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={showFontList ? fontSearch : (elements.find(el => el.id === selectedId)?.fontFamily || 'sans-serif')}
                                    onChange={(e) => {
                                        setFontSearch(e.target.value);
                                        setShowFontList(true);
                                    }}
                                    onFocus={() => {
                                        setFontSearch('');
                                        setShowFontList(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowFontList(false), 200)}
                                    placeholder="Search Google Fonts..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
                                />
                                {showFontList && (
                                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-800 rounded-md shadow-xl z-50 custom-scrollbar">
                                        {['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', ...googleFonts]
                                            .filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
                                            .map(font => (
                                            <button
                                                key={font}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                                onClick={() => {
                                                    updateSelected('fontFamily', font);
                                                    setShowFontList(false);
                                                    setFontSearch('');
                                                }}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div className="space-y-1">
                                <label className="text-xs text-slate-500">Size</label>
                                <input 
                                    type="number" 
                                    value={elements.find(el => el.id === selectedId)?.size || 16}
                                    onChange={(e) => updateSelected('size', Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs text-slate-500">Color</label>
                                <div className="flex items-center gap-2 h-[38px] bg-slate-900 border border-slate-800 rounded-md px-2">
                                    <input 
                                        type="color" 
                                        value={elements.find(el => el.id === selectedId)?.color || '#ffffff'}
                                        onChange={(e) => updateSelected('color', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <span className="text-xs font-mono text-slate-400 flex-1 truncate">
                                        {elements.find(el => el.id === selectedId)?.color}
                                    </span>
                                </div>
                             </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => updateSelected('bold', !elements.find(el => el.id === selectedId)?.bold)}
                                className={`flex-1 py-2 rounded-md border transition-all ${elements.find(el => el.id === selectedId)?.bold ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                <Icons.Bold size={16} className="mx-auto" />
                            </button>
                            <button 
                                onClick={() => updateSelected('italic', !elements.find(el => el.id === selectedId)?.italic)}
                                className={`flex-1 py-2 rounded-md border transition-all ${elements.find(el => el.id === selectedId)?.italic ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                <Icons.Italic size={16} className="mx-auto" />
                            </button>
                            <button 
                                onClick={() => updateSelected('underline', !elements.find(el => el.id === selectedId)?.underline)}
                                className={`flex-1 py-2 rounded-md border transition-all ${elements.find(el => el.id === selectedId)?.underline ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                <Icons.Underline size={16} className="mx-auto" />
                            </button>
                        </div>

                        {/* Effects Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effects</h4>
                            
                            {/* Shadow */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-400 font-medium">Shadow</label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 h-[32px]">
                                        <input 
                                            type="color" 
                                            value={elements.find(el => el.id === selectedId)?.shadowColor === 'transparent' ? '#000000' : elements.find(el => el.id === selectedId)?.shadowColor || '#000000'}
                                            onChange={(e) => updateSelected('shadowColor', e.target.value)}
                                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-xs text-slate-500">Color</span>
                                        <button 
                                            onClick={() => updateSelected('shadowColor', 'transparent')}
                                            className="ml-auto text-[10px] text-slate-500 hover:text-red-400"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">Blur</label>
                                        <input type="number" value={elements.find(el => el.id === selectedId)?.shadowBlur || 0} onChange={(e) => updateSelected('shadowBlur', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">X Offset</label>
                                        <input type="number" value={elements.find(el => el.id === selectedId)?.shadowOffsetX || 0} onChange={(e) => updateSelected('shadowOffsetX', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">Y Offset</label>
                                        <input type="number" value={elements.find(el => el.id === selectedId)?.shadowOffsetY || 0} onChange={(e) => updateSelected('shadowOffsetY', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Neon */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-400 font-medium">Neon Glow</label>
                                    <Switch 
                                        checked={elements.find(el => el.id === selectedId)?.neon?.enabled || false}
                                        onChange={(checked) => {
                                            const el = elements.find(el => el.id === selectedId);
                                            updateSelected('neon', { ...el?.neon, enabled: checked });
                                        }}
                                    />
                                </div>
                                {elements.find(el => el.id === selectedId)?.neon?.enabled && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="col-span-2 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 h-[32px]">
                                            <input 
                                                type="color" 
                                                value={elements.find(el => el.id === selectedId)?.neon?.color || '#00ff00'}
                                                onChange={(e) => {
                                                    const el = elements.find(el => el.id === selectedId);
                                                    updateSelected('neon', { ...el?.neon, color: e.target.value });
                                                }}
                                                className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0"
                                            />
                                            <span className="text-xs text-slate-500">Glow Color</span>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] text-slate-500">Intensity</label>
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
                                    <label className="text-xs text-slate-400 font-medium">Gradient Fill</label>
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
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500">Angle ({elements.find(el => el.id === selectedId)?.gradient?.angle}°)</label>
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
                                            <label className="text-[10px] text-slate-500">Gradient Preview</label>
                                            <GradientSlider 
                                                stops={elements.find(el => el.id === selectedId)?.gradient?.stops || []}
                                                onChange={(newStops) => {
                                                    const el = elements.find(el => el.id === selectedId);
                                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-500">Colors</label>
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
                                                        className="text-slate-500 hover:text-red-400"
                                                    >
                                                        <Icons.Trash size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => {
                                                    const el = elements.find(el => el.id === selectedId);
                                                    const newStops = [...(el?.gradient?.stops || []), { offset: 0.5, color: '#ffffff' }];
                                                    updateSelected('gradient', { ...el?.gradient, stops: newStops });
                                                }}
                                                className="w-full py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                                            >
                                                Add Stop
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
                            <label className="text-xs text-slate-500">Image URL</label>
                            <input 
                                type="text" 
                                value={elements.find(el => el.id === selectedId)?.src || ''}
                                onChange={(e) => updateSelected('src', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={fitToWidth} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 text-xs text-slate-300">
                                <Icons.Max size={14} /> Fit Width
                            </button>
                            <button onClick={fitToHeight} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 text-xs text-slate-300">
                                <Icons.Max size={14} className="rotate-90" /> Fit Height
                            </button>
                        </div>
                    </>
                )}
            </div>
          )}

        </aside>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-slate-950 relative overflow-auto custom-scrollbar">
            <div className="min-h-full min-w-full flex items-center justify-center p-8">
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
                    />
                </div>
            </div>
            
            <div className="fixed bottom-6 right-6 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-800 text-xs text-slate-500 pointer-events-none z-10">
                {Math.round(canvasWidth)} x {Math.round(canvasHeight)} px
            </div>
        </div>
      </main>
    </div>
  );
}