
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { NAV_ITEMS } from '../../constants';
import { Menu, Sun, Moon, ArrowRight } from 'lucide-react';
import AICopilot from './AICopilot';
import MatrixBackground from './MatrixBackground';

const MotionDiv = motion.div as any;

interface ShellProps {
  children: React.ReactNode;
  activeModule: string;
  onNavigate: (id: string) => void;
}

const Shell: React.FC<ShellProps> = ({ children, activeModule, onNavigate }) => {
  const { themeMode, toggleThemeMode } = useSystem();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isDark = themeMode === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans relative ${isDark ? 'bg-[#030303] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {isDark ? (
          <>
            <MatrixBackground />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Floating Glass Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? (isDark ? 'bg-[#030303]/80 backdrop-blur-xl border-b border-white/5' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm') : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
             className="flex items-center gap-3 cursor-pointer group"
             onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
              IB
            </div>
            <span className={`font-heading font-semibold tracking-tight hidden sm:block ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Issa Berger
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeModule === item.id 
                    ? (isDark ? 'bg-white text-black shadow-md' : 'bg-white text-gray-900 shadow-sm border border-gray-200')
                    : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50')
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
             <button onClick={toggleThemeMode} className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <button 
               onClick={() => onNavigate('onboarding')}
               className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
             >
               Hire Me <ArrowRight size={16} />
             </button>

             {/* Mobile Menu Toggle */}
             <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
               <Menu size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-20 min-h-screen">
        <AnimatePresence mode='wait'>
          <MotionDiv
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full max-w-7xl mx-auto px-6"
          >
            {children}
          </MotionDiv>
        </AnimatePresence>
      </main>

      {/* AI Assistant */}
      <AICopilot />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <MotionDiv
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center space-y-6 md:hidden ${isDark ? 'bg-black/90' : 'bg-white/95'}`}
          >
             <button onClick={() => setMenuOpen(false)} className={`absolute top-6 right-6 p-2 ${isDark ? 'text-white' : 'text-black'}`}>
               <Menu size={32} className="rotate-90" />
             </button>
             {NAV_ITEMS.map(item => (
               <button
                 key={item.id}
                 onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
                 className={`text-2xl font-heading font-medium tracking-wide flex items-center gap-3 transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
               >
                 <item.icon size={24} /> {item.label}
               </button>
             ))}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shell;
