import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { MOCK_INTEL } from '../../constants';
import { Radio, ShieldAlert, Cpu, Globe, Zap, ExternalLink, Activity, Satellite, Lock, Hash } from 'lucide-react';
import CyberButton from '../ui/CyberButton';

const MotionDiv = motion.div as any;

const CATEGORIES = [
  { id: 'all', label: 'WIDE_BAND', icon: Globe },
  { id: 'security', label: 'NET_SEC', icon: ShieldAlert },
  { id: 'hardware', label: 'CORE_GEAR', icon: Zap },
  { id: 'ai', label: 'NEURAL', icon: Cpu },
];

const NewsModule = () => {
  const { colors, proMode } = useSystem();
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState<typeof MOCK_INTEL>([]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = activeCat === 'all' 
        ? MOCK_INTEL 
        : MOCK_INTEL.filter(item => item.category.toLowerCase() === activeCat);
      setVisibleItems(filtered);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeCat]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-black font-sans relative">
      {/* Dynamic Data Ticker */}
      <div className="bg-primary/5 border-b border-primary/20 py-2 overflow-hidden flex items-center whitespace-nowrap z-20">
        <div className="px-5 text-[10px] font-mono text-primary flex items-center gap-2 border-r border-primary/20 shrink-0 bg-black">
          <Activity size={12} className="animate-pulse" /> UPLINK_ACTIVE
        </div>
        <MotionDiv 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 px-6"
        >
          {MOCK_INTEL.map((n, i) => (
            <span key={i} className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
               SOURCE_{n.source.toUpperCase()} // PACKET_{n.id}092 // STATUS_{n.priority}
            </span>
          ))}
        </MotionDiv>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Background Decorative Layer */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(var(--color-primary-rgb),0.2)_50%,transparent_100%)] bg-[size:100%_4px] animate-[scanlines_2s_linear_infinite]" />
           <div className="grid grid-cols-12 gap-1 h-full w-full opacity-20">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="border-r border-primary/20 h-full" />
              ))}
           </div>
        </div>

        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-800 p-4 shrink-0 bg-black/40 z-10 backdrop-blur-md">
          <div className="space-y-6">
            <div className="hidden md:block">
              <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] mb-4 px-2">Bandwidth_Frequencies</h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold uppercase transition-all border ${
                      activeCat === cat.id 
                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]' 
                        : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <cat.icon size={14} className={activeCat === cat.id ? 'animate-pulse' : ''} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block bg-gray-900/30 p-4 border border-gray-800 rounded">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-gray-600 uppercase font-mono tracking-tighter">Signal_Integrity</span>
                  <span className="text-[9px] text-primary animate-pulse font-mono">ENCRYPTED</span>
               </div>
               <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <MotionDiv animate={{ width: ['20%', '90%', '40%', '85%'] }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-primary" />
               </div>
               <div className="mt-3 grid grid-cols-4 gap-1">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className={`h-1 rounded-full ${Math.random() > 0.5 ? 'bg-primary/40' : 'bg-gray-800'}`} />
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <MotionDiv 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <Satellite className="text-primary animate-bounce" size={48} />
                <div className="text-primary font-mono text-xs tracking-[0.3em] uppercase animate-pulse">Syncing Deep-Net Nodes...</div>
              </MotionDiv>
            ) : (
              <MotionDiv 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
              >
                {visibleItems.map((item, idx) => (
                  <MotionDiv
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-gray-900/30 border border-gray-800 p-6 rounded hover:border-primary/50 transition-all duration-300 overflow-hidden"
                  >
                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gray-800 group-hover:border-primary transition-colors" />
                    
                    <div className="flex justify-between items-start mb-4">
                       <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                         item.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 text-red-500' : 
                         item.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/40 text-orange-500' :
                         'bg-primary/10 border-primary/40 text-primary'
                       }`}>
                          {item.priority} // {item.category}
                       </span>
                       <span className="text-[10px] font-mono text-gray-600">{item.timestamp}</span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-primary transition-colors leading-tight uppercase">
                       {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed font-mono">
                       {item.summary}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                       <div className="text-[10px] font-mono text-gray-500">
                          SRC: <span className="text-gray-300">{item.source}</span>
                       </div>
                       <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                          DECRYPT_LINK <ExternalLink size={10} />
                       </button>
                    </div>
                  </MotionDiv>
                ))}
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NewsModule;