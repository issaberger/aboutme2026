import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { Search, ArrowRight, Monitor, Folder, Activity, ShieldCheck, BarChart3 } from 'lucide-react';
import { PaletteName } from '../../types';
import { PALETTES } from '../../constants';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { setPalette, toggleProMode, unlockAchievement } = useSystem();
  const [query, setQuery] = useState('');

  // Unlock achievement on use
  useEffect(() => {
    if (isOpen) unlockAchievement('operator');
  }, [isOpen]);

  const commands = [
    { id: 'home', label: 'Go to Home', icon: Monitor, action: () => onNavigate('home') },
    { id: 'dossier', label: 'View Dossier (Bio & Resume)', icon: ShieldCheck, action: () => onNavigate('dossier') },
    { id: 'projects', label: 'View Projects', icon: Folder, action: () => onNavigate('projects') },
    { id: 'intel', label: 'Global Intel Feed', icon: Activity, action: () => onNavigate('intel') },
    { id: 'market', label: 'Stock Market Terminal', icon: BarChart3, action: () => onNavigate('market') },
    { id: 'toggle-pro', label: 'Toggle Pro Mode', icon: Monitor, action: toggleProMode },
    // Palettes
    ...Object.keys(PALETTES).map(p => ({
       id: `theme-${p}`,
       label: `Theme: ${p.replace('_', ' ')}`,
       icon: Monitor,
       action: () => setPalette(p as PaletteName)
    }))
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center border-b border-gray-800 p-4">
          <Search className="text-gray-500 mr-3" />
          <input 
            autoFocus
            className="bg-transparent outline-none w-full text-white placeholder-gray-600 font-mono"
            placeholder="Type a command..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((cmd, i) => (
             <button
               key={cmd.id + i}
               onClick={() => { cmd.action(); onClose(); }}
               className="w-full text-left px-4 py-3 hover:bg-white/5 rounded flex items-center justify-between group transition-colors"
             >
                <div className="flex items-center gap-3">
                   <cmd.icon size={16} className="text-gray-500 group-hover:text-primary" />
                   <span className="text-gray-300 group-hover:text-white">{cmd.label}</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-primary -translate-x-2 group-hover:translate-x-0 transition-all" />
             </button>
          ))}
          {filtered.length === 0 && (
             <div className="p-4 text-center text-gray-500 text-sm">No commands found.</div>
          )}
        </div>
        <div className="bg-gray-950 p-2 border-t border-gray-800 text-[10px] text-gray-500 flex justify-end gap-4 px-4">
           <span>Select ↵</span>
           <span>Navigate ↑↓</span>
           <span>Close ESC</span>
        </div>
      </MotionDiv>
    </div>
  );
};

export default CommandPalette;