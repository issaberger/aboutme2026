import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PaletteName, Achievement } from '../../types';
import { PALETTES, ACHIEVEMENTS_LIST } from '../../constants';
import { Menu, Palette, Monitor, Terminal, Folder, Layers, FileText, Send, Gamepad2 } from 'lucide-react';
import Cursor from './Cursor';
import BootSequence from './BootSequence';
import MatrixBackground from './MatrixBackground';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Monitor },
  { id: 'about', label: 'About', icon: Terminal },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
  { id: 'contact', label: 'Contact', icon: Send },
];

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
          <span className="hidden md:block font-mono text-xs opacity-60">
             ISSA_OS // SYSTEM READY
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-gray-800">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-wider transition-all ${
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
             className={`text-xs font-mono border px-2 py-1 rounded transition-all ${proMode ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-500'}`}
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
      <main className="absolute top-16 bottom-0 left-0 right-0 overflow-hidden z-10">
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Achievement Toast */}
      <AnimatePresence>
        {recentAchievement && (
           <motion.div
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className="fixed bottom-8 right-8 bg-gray-900 border border-primary p-4 rounded shadow-lg z-50 flex items-center gap-4 max-w-sm"
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
               className="text-2xl font-bold uppercase tracking-widest text-white hover:text-primary"
             >
               {item.label}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default Shell;