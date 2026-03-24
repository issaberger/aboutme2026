import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROFILE, NAV_ITEMS } from '../../constants';
import CyberButton from '../ui/CyberButton';
import { ArrowRight, FileText, Mail, Grid } from 'lucide-react';

// Fix: Cast motion components to any to avoid TypeScript errors with framer-motion props
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
const MotionH2 = motion.h2 as any;
const MotionButton = motion.button as any;

const HomeModule = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const { proMode, colors } = useSystem();
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % PROFILE.taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden p-6">
      
      {/* Background Ambience */}
      {!proMode && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <MotionDiv 
            className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
            animate={{
              background: [
                `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
                `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`
              ],
              x: '-50%',
              y: '-50%',
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8 shrink-0 mb-16">
        
        <MotionDiv
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">System Online v3.0</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-4 text-white">
            {PROFILE.name}
          </h1>

          <div className="h-8 md:h-12 overflow-hidden flex justify-center">
            <MotionH2
              key={subtitleIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 font-medium"
            >
              {PROFILE.taglines[subtitleIndex]}
            </MotionH2>
          </div>
        </MotionDiv>

      </div>

      {/* Bento Grid Navigation */}
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NAV_ITEMS.filter(item => item.id !== 'home').map((item, idx) => (
             <MotionButton
               key={item.id}
               onClick={() => onNavigate(item.id)}
               whileHover={{ scale: 1.02, y: -2 }}
               whileTap={{ scale: 0.98 }}
               className="group relative bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all text-left flex flex-col justify-between h-40 overflow-hidden backdrop-blur-sm"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                   <item.icon size={64} />
                </div>
                
                <div className="p-2 bg-white/5 rounded-lg w-fit mb-4 group-hover:bg-white/10 transition-colors">
                   <item.icon className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                </div>
                
                <div>
                   <div className="font-semibold text-white text-lg tracking-tight">{item.label}</div>
                   <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">{item.desc}</div>
                </div>
             </MotionButton>
          ))}
        </div>
      </MotionDiv>

      <style>{`
        /* Removed glitch styles for cleaner look */
      `}</style>
    </div>
  );
};

export default HomeModule;