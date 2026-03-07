
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PaletteName, Achievement } from '../../types';
import { PALETTES, ACHIEVEMENTS_LIST, NAV_ITEMS } from '../../constants';
import { Menu, Palette, Wifi, Activity, Battery, Clock, Sun, Moon } from 'lucide-react';
import Cursor from './Cursor';
import BootSequence from './BootSequence';
import MatrixBackground from './MatrixBackground';
import FloatingIcons from './FloatingIcons';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

interface ShellProps {
  children: React.ReactNode;
  activeModule: string;
  onNavigate: (id: string) => void;
}

const Shell: React.FC<ShellProps> = ({ children, activeModule, onNavigate }) => {
  const { 
    proMode, toggleProMode, 
    palette, setPalette, colors,
    booted, setBooted,
    achievements,
    themeMode, toggleThemeMode
  } = useSystem();

  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Synthesized Boot Sound
  const playBootSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Signal Path
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Sound Design (Futuristic Swell)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.1); // Quick sweep up
      osc.frequency.linearRampToValueAtTime(440, t + 0.4); // Settle down

      // Filter Sweep
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(0, t);
      filter.frequency.linearRampToValueAtTime(5000, t + 0.1);
      
      // Envelope
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.start(t);
      osc.stop(t + 1.5);
    } catch (e) {
      console.warn("Audio Context blocked or failed", e);
    }
  }, []);

  // Update time for footer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle achievement toast
  useEffect(() => {
    if (achievements.length > 0) {
      const lastId = achievements[achievements.length - 1];
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === lastId);
      if (ach) {
        setRecentAchievement(ach);
        const timer = setTimeout(() => setRecentAchievement(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievements.length]);

  // CSS Variables for dynamic themes
  const styleVars = {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-bg': colors.bg,
    '--color-panel': colors.panel,
    '--color-text': colors.text,
    '--color-primary-rgb': palette === 'NEON_RAIN' ? '6, 182, 212' : 
                          palette === 'ACID_JUNGLE' ? '132, 204, 22' :
                          palette === 'VIOLET_CIRCUIT' ? '139, 92, 246' :
                          palette === 'RED_ALERT' ? '239, 68, 68' : '56, 189, 248'
  } as React.CSSProperties;

  if (!booted) {
    return (
      <div style={styleVars} className="fixed inset-0 bg-bg text-primary font-mono">
        <BootSequence onComplete={() => {
            setBooted(true);
            playBootSound();
        }} />
      </div>
    );
  }

  return (
    <div style={styleVars} className={`fixed inset-0 overflow-hidden bg-bg text-[var(--color-text)] transition-colors duration-700 font-body selection:bg-primary/20`}>
      <Cursor />
      
      {/* Background Effects - Subtle & Modern */}
      {!proMode && themeMode === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--color-secondary-rgb),0.15),transparent_50%)] opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
          <FloatingIcons />
        </>
      )}
      
      {/* Light mode background icons */}
      {!proMode && themeMode === 'light' && (
         <FloatingIcons />
      )}

      {/* Top Bar - Floating & Glass */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className={`rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-between px-6 py-3 transition-all duration-300 ${themeMode === 'light' ? 'bg-white/70' : 'bg-black/40'}`}>
          
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
               <span className="font-bold text-xs text-white font-sans">IB</span>
            </div>
            <div className="hidden sm:flex flex-col">
               <span className="text-xs font-bold tracking-wide font-sans">ISSA BERGER</span>
               <span className="text-[9px] opacity-50 font-mono tracking-wider">AI ENGINEER</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 font-sans ${
                  activeModule === item.id 
                    ? 'text-white bg-white/10 shadow-inner' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
                {activeModule === item.id && (
                  <MotionDiv 
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             {/* Theme Toggle */}
             <button onClick={toggleThemeMode} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
               {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
             </button>

             {/* Palette Toggle */}
             <div className="relative">
                <button onClick={() => setPaletteOpen(!paletteOpen)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <Palette size={16} />
                </button>
                {paletteOpen && (
                  <div className="absolute top-full right-0 mt-4 border border-white/10 p-2 rounded-xl w-48 space-y-1 shadow-2xl bg-black/80 backdrop-blur-xl">
                     {Object.keys(PALETTES).map((p) => (
                        <button
                          key={p}
                          onClick={() => { setPalette(p as PaletteName); setPaletteOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-3 hover:bg-white/10 transition-colors text-gray-300 hover:text-white font-sans"
                        >
                           <div className="w-2 h-2 rounded-full ring-1 ring-white/20" style={{ backgroundColor: PALETTES[p as PaletteName].primary }} />
                           {p.replace('_', ' ')}
                        </button>
                     ))}
                  </div>
                )}
             </div>

             {/* Mobile Menu Toggle */}
             <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
               <Menu size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="absolute inset-0 pt-28 pb-12 px-4 md:px-8 overflow-hidden z-10">
        <AnimatePresence mode='wait'>
          <MotionDiv
            key={activeModule}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full max-w-7xl mx-auto"
          >
            {children}
          </MotionDiv>
        </AnimatePresence>
      </main>

      {/* System Footer - Minimal */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 flex items-center justify-between text-[10px] font-mono opacity-40 hover:opacity-100 transition-opacity duration-500 z-40 pointer-events-none">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${booted ? 'bg-emerald-500' : 'bg-red-500'}`} /> 
               SYSTEM_READY
            </span>
            <span className="hidden md:inline">LATENCY: 12ms</span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Wifi size={10} /> 5G
             </div>
             <div className="flex items-center gap-2">
                <Clock size={10} /> {time}
             </div>
          </div>
      </footer>

      {/* Achievement Toast */}
      <AnimatePresence>
        {recentAchievement && (
           <MotionDiv
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className={`fixed bottom-12 right-8 border border-primary p-4 rounded shadow-lg z-50 flex items-center gap-4 max-w-sm ${themeMode === 'light' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}
           >
              <div className="text-2xl">{recentAchievement.icon}</div>
              <div>
                 <h4 className="text-primary font-bold text-sm font-sans">ACHIEVEMENT UNLOCKED</h4>
                 <p className="font-bold font-sans">{recentAchievement.title}</p>
                 <p className="opacity-60 text-xs font-mono">{recentAchievement.description}</p>
              </div>
           </MotionDiv>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center space-y-6 md:hidden ${themeMode === 'light' ? 'bg-white/95' : 'bg-black/95'}`}>
           <button onClick={() => setMenuOpen(false)} className={`absolute top-6 right-6 p-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
             <Menu className="rotate-90" />
           </button>
           {NAV_ITEMS.map(item => (
             <button
               key={item.id}
               onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
               className={`text-2xl font-bold uppercase tracking-widest hover:text-primary flex items-center gap-3 font-sans ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
             >
               <item.icon size={24} /> {item.label}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default Shell;
