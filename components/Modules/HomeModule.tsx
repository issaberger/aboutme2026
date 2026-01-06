import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROFILE } from '../../constants';
import CyberButton from '../ui/CyberButton';
import { ArrowRight, FileText, Mail } from 'lucide-react';

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
    <div className="relative h-full flex flex-col justify-center items-center overflow-hidden p-6">
      
      {/* Background Grid - WebGL Imitation */}
      {!proMode && (
        <div className="absolute inset-0 z-0 opacity-20 perspective-1000">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_scale(2)] origin-top animate-[pulse-fast_10s_infinite]" />
          <motion.div 
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

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-primary font-mono text-sm tracking-[0.5em] mb-4 uppercase">
            System Online • v2.5.0
          </h2>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 relative inline-block">
            <span className={`relative z-10 ${!proMode ? 'glitch-text' : ''}`} data-text={PROFILE.name}>
              {PROFILE.name.toUpperCase()}
            </span>
            {!proMode && (
               <motion.span 
                 className="absolute -inset-1 bg-primary/20 blur-xl -z-10"
                 animate={{ opacity: [0.5, 0.8, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity }}
               />
            )}
          </h1>

          <div className="h-8 md:h-12 overflow-hidden mt-4">
            <motion.p
              key={subtitleIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="text-xl md:text-2xl text-gray-400 font-mono"
            >
              {`> ${PROFILE.taglines[subtitleIndex]}`}
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <CyberButton onClick={() => onNavigate('projects')}>
            Explore Projects <ArrowRight size={18} />
          </CyberButton>
          <CyberButton variant="secondary" onClick={() => onNavigate('contact')}>
            Initialize Comms <Mail size={18} />
          </CyberButton>
          <CyberButton variant="secondary" className="opacity-70" onClick={() => onNavigate('resume')}>
              View Resume <FileText size={18} />
          </CyberButton>
        </motion.div>

      </div>

      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-0 w-full px-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-500 border-t border-gray-800 pt-4 max-w-6xl mx-auto">
          <div className="flex gap-4">
            <span>LOC: {PROFILE.location}</span>
            <span className="text-green-500">● AVAILABLE FOR HIRE</span>
          </div>
          <div className="mt-2 md:mt-0">
             LATENCY: 12ms // SECURE CONNECTION
          </div>
        </div>
      </motion.div>

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