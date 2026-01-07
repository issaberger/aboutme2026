import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PaletteName, Achievement } from '../../types';
import { PALETTES, ACHIEVEMENTS_LIST, NAV_ITEMS } from '../../constants';
import { Menu, Palette, Wifi, Activity, Battery, Clock } from 'lucide-react';
import Cursor from './Cursor';
import BootSequence from './BootSequence';
import MatrixBackground from './MatrixBackground';

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
    achievements
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
    <div style={styleVars} className={`fixed inset-0 overflow-hidden bg-bg text-gray-200 transition-colors duration-500 font-sans ${!proMode ? 'font-cyber' : ''}`}>
      <Cursor />
      
      {/* Background Effects */}
      {!proMode && <MatrixBackground />}
      {!proMode && <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-10" />}
      {!proMode && <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-bg to-bg" />}

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-800 bg-bg/90 backdrop-blur-md z-40 flex items-center justify-between px-6">
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

        <nav className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-gray-800">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 lg:px-4 py-1.5 rounded-full text-[10px] lg:text-xs uppercase font-bold tracking-wider transition-all ${
                activeModule === item.id 
                  ? 'bg-primary text-black shadow-[0_0_15px_var(--color-primary)]' 
                  : 'hover:text-primary hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           {/* Palette Toggle */}
           <div className="relative">
              <button onClick={() => setPaletteOpen(!paletteOpen)} className="p-2 hover:text-primary transition-colors">
                <Palette size={20} />
              </button>
              {paletteOpen && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 p-2 rounded-lg w-40 space-y-2 shadow-xl">
                   {Object.keys(PALETTES).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPalette(p as PaletteName); setPaletteOpen(false); }}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-800 rounded flex items-center gap-2"
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
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 10, filter: 'blur(5px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* System Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-black/90 border-t border-gray-800 backdrop-blur flex items-center justify-between px-4 text-[10px] font-mono z-50 text-gray-500 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-primary animate-pulse">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" /> ONLINE
            </span>
            <span className="hidden md:inline">CPU: 14%</span>
            <span className="hidden md:inline">MEM: 64TB</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 opacity-50 hidden sm:block">
             © 2025 ISSA BERGER SYSTEMS // ALL RIGHTS RESERVED
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
                <Wifi size={10} /> 10Gbps
             </div>
             <div className="flex items-center gap-1">
                <Battery size={10} /> 100%
             </div>
             <div className="flex items-center gap-1 text-gray-300">
                <Clock size={10} /> {time}
             </div>
          </div>
      </footer>

      {/* Achievement Toast */}
      <AnimatePresence>
        {recentAchievement && (
           <motion.div
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className="fixed bottom-12 right-8 bg-gray-900 border border-primary p-4 rounded shadow-lg z-50 flex items-center gap-4 max-w-sm"
           >
              <div className="text-2xl">{recentAchievement.icon}</div>
              <div>
                 <h4 className="text-primary font-bold text-sm">ACHIEVEMENT UNLOCKED</h4>
                 <p className="text-white font-bold">{recentAchievement.title}</p>
                 <p className="text-gray-400 text-xs">{recentAchievement.description}</p>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center space-y-6 md:hidden">
           <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 p-2 text-white">
             <Menu className="rotate-90" />
           </button>
           {NAV_ITEMS.map(item => (
             <button
               key={item.id}
               onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
               className="text-2xl font-bold uppercase tracking-widest text-white hover:text-primary flex items-center gap-3"
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