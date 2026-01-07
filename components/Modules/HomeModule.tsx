import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROFILE, NAV_ITEMS } from '../../constants';
import CyberButton from '../ui/CyberButton';
import { ArrowRight, FileText, Mail, Grid } from 'lucide-react';

// Fix: Cast motion components to any to avoid TypeScript errors with framer-motion props
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
const MotionP = motion.p as any;
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
    <div className="relative h-full flex flex-col items-center overflow-y-auto overflow-x-hidden p-6">
      
      {/* Background Grid - WebGL Imitation */}
      {!proMode && (
        <div className="fixed inset-0 z-0 opacity-20 perspective-1000 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_scale(2)] origin-top animate-[pulse-fast_10s_infinite]" />
          <MotionDiv 
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[100px]"
            animate={{
              background: [
                `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
                `radial-gradient(circle, ${colors.secondary}40 0%, transparent 70%)`,
                `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`
              ],
              x: '-50%',
              y: '-50%',
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-4 md:space-y-6 pt-10 md:pt-20 shrink-0">
        
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-primary font-mono text-sm tracking-[0.5em] mb-4 uppercase">
            System Online • v2.5.1
          </h2>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 relative inline-block">
            <span className={`relative z-10 ${!proMode ? 'glitch-text' : ''}`} data-text={PROFILE.name}>
              {PROFILE.name.toUpperCase()}
            </span>
            {!proMode && (
               <MotionSpan 
                 className="absolute -inset-1 bg-primary/20 blur-xl -z-10"
                 animate={{ opacity: [0.5, 0.8, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity }}
               />
            )}
          </h1>

          <div className="h-8 md:h-12 overflow-hidden mt-2">
            <MotionP
              key={subtitleIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-lg md:text-2xl text-gray-400 font-mono"
            >
              {`> ${PROFILE.taglines[subtitleIndex]}`}
            </MotionP>
          </div>
        </MotionDiv>

      </div>

      {/* Module Grid - "Easier Navigation" */}
      <MotionDiv
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 w-full max-w-5xl mt-12 md:mt-20 pb-24"
      >
        <div className="flex items-center gap-2 mb-6 text-gray-500 font-mono text-xs uppercase tracking-widest pl-2">
           <Grid size={14} /> System Modules
           <div className="h-[1px] bg-gray-800 flex-1" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {NAV_ITEMS.filter(item => item.id !== 'home').map((item, idx) => (
             <MotionButton
               key={item.id}
               onClick={() => onNavigate(item.id)}
               whileHover={{ scale: 1.02, y: -2 }}
               whileTap={{ scale: 0.98 }}
               className="group relative bg-gray-900/40 border border-gray-800 p-4 rounded-lg hover:border-primary/50 hover:bg-gray-800/60 transition-all text-left flex flex-col justify-between h-32 overflow-hidden"
             >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start">
                   <item.icon className="text-gray-500 group-hover:text-primary transition-colors" size={24} />
                   <ArrowRight size={16} className="text-gray-700 group-hover:text-primary -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                
                <div>
                   <div className="font-bold text-white group-hover:text-primary transition-colors">{item.label}</div>
                   <div className="text-[10px] text-gray-500 font-mono mt-1 group-hover:text-gray-400">{item.desc}</div>
                </div>
             </MotionButton>
          ))}
        </div>
      </MotionDiv>

      <style>{`
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        .glitch-text::before {
          color: ${colors.secondary};
          z-index: -1;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          color: ${colors.primary};
          z-index: -2;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          animation: glitch-anim-2 2s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        @keyframes glitch-anim-2 {
          0% { transform: translate(0) }
          20% { transform: translate(2px, -2px) }
          40% { transform: translate(2px, 2px) }
          60% { transform: translate(-2px, -2px) }
          80% { transform: translate(-2px, 2px) }
          100% { transform: translate(0) }
        }
      `}</style>
    </div>
  );
};

export default HomeModule;