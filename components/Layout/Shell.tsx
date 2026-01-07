import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PaletteName, Achievement } from '../../types';
import { PALETTES, ACHIEVEMENTS_LIST, NAV_ITEMS } from '../../constants';
import { Menu, Palette, Wifi, Activity, Battery, Clock, Sun, Moon } from 'lucide-react';
import Cursor from './Cursor';
import BootSequence from './BootSequence';
import MatrixBackground from './MatrixBackground';

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
        <BootSequence onComplete={() => setBooted(true)} />
      </div>
    );
  }

  return (
    <div style={styleVars} className={`fixed inset-0 overflow-hidden bg-bg text-[var(--color-text)] transition-colors duration-500 font-sans ${!proMode ? 'font-cyber' : ''}`}>
      <Cursor />
      
      {/* Background Effects */}
      {!proMode && themeMode === 'dark' && <MatrixBackground />}
      {!proMode && <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-10" />}
      {!proMode && <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-bg to-bg" />}

      {/* Top Bar */}
      <header className={`fixed top-0 left-0 right-0 h-16 border-b z-40 flex items-center justify-between px-6 backdrop-blur-md transition-colors ${themeMode === 'light' ? 'bg-white/80 border-gray-200' : 'bg-black/80 border-gray-800'}`}>
        <div className="flex items-center gap-4">
          <div 
             className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center font-black text-bg cursor-pointer hover:animate-pulse"
             onClick={() => onNavigate('home')}
          >
            IB
          </div>
          <span className="hidden lg:block font-mono text-xs opacity-60">
             ISSA_OS // SYSTEM READY
          </span>
        </div>

        <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-colors ${themeMode === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-black/20 border-gray-800'}`}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 lg:px-4 py-1.5 rounded-full text-[10px] lg:text-xs uppercase font-bold tracking-wider transition-all ${
                activeModule === item.id 
                  ? 'bg-primary text-black shadow-[0_0_15px_var(--color-primary)]' 
                  : 'hover:text-primary hover:bg-black/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           {/* Theme Toggle */}
           <button onClick={toggleThemeMode} className="p-2 hover:text-primary transition-colors">
             {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           {/* Palette Toggle */}
           <div className="relative">
              <button onClick={() => setPaletteOpen(!paletteOpen)} className="p-2 hover:text-primary transition-colors">
                <Palette size={20} />
              </button>
              {paletteOpen && (
                <div className={`absolute top-full right-0 mt-2 border p-2 rounded-lg w-40 space-y-2 shadow-xl ${themeMode === 'light' ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-900 border-gray-700 text-white'}`}>
                   {Object.keys(PALETTES).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPalette(p as PaletteName); setPaletteOpen(false); }}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 ${themeMode === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                      >
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTES[p as PaletteName].primary }} />
                         {p.replace('_', ' ')}
                      </button>
                   ))}
                </div>
              )}
           </div>

           {/* Pro Mode Switch */}
           <button 
             onClick={toggleProMode}
             className={`text-[10px] md:text-xs font-mono border px-2 py-1 rounded transition-all ${proMode ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-500'}`}
           >
             {proMode ? 'PRO ON' : 'PRO OFF'}
           </button>

           {/* Mobile Menu Toggle */}
           <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
             <Menu />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="absolute top-16 bottom-8 left-0 right-0 overflow-hidden z-10">
        <AnimatePresence mode='wait'>
          <MotionDiv
            key={activeModule}
            initial={{ opacity: 0, x: 10, filter: 'blur(5px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="h-full w-full"
          >
            {children}
          </MotionDiv>
        </AnimatePresence>
      </main>

      {/* System Footer Status Bar */}
      <footer className={`fixed bottom-0 left-0 right-0 h-8 border-t backdrop-blur flex items-center justify-between px-4 text-[10px] font-mono z-50 select-none ${themeMode === 'light' ? 'bg-white/90 border-gray-300 text-gray-500' : 'bg-black/90 border-gray-800 text-gray-500'}`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-primary animate-pulse">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" /> ONLINE
            </span>
            <span className="hidden md:inline">CPU: 14%</span>
            <span className="hidden md:inline">MEM: 64TB</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 opacity-50 hidden sm:block">
             © 2026 ISSA BERGER SYSTEMS // CREATED BY ISSA BERGER
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
                <Wifi size={10} /> 10Gbps
             </div>
             <div className="flex items-center gap-1">
                <Battery size={10} /> 100%
             </div>
             <div className="flex items-center gap-1 opacity-80">
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
                 <h4 className="text-primary font-bold text-sm">ACHIEVEMENT UNLOCKED</h4>
                 <p className="font-bold">{recentAchievement.title}</p>
                 <p className="opacity-60 text-xs">{recentAchievement.description}</p>
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
               className={`text-2xl font-bold uppercase tracking-widest hover:text-primary flex items-center gap-3 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
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