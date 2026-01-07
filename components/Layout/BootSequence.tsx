import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('INITIALIZING KERNEL...');

  const logs = [
    'LOADING MODULES...',
    'MOUNTING FILE SYSTEM...',
    'ESTABLISHING SECURE LINK...',
    'LOADING NEURAL INTERFACE...',
    'ISSA_OS BOOT SUCCESSFUL'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    const logTimer = setInterval(() => {
       setText(logs[Math.floor(Math.random() * logs.length)]);
    }, 600);

    const finishTimer = setTimeout(onComplete, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-green-500 font-mono p-8">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between text-xs mb-1">
           <span>BOOT_SEQUENCE.EXE</span>
           <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-900 w-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="h-32 font-mono text-xs text-gray-400 overflow-hidden border border-gray-800 p-2 bg-black/50">
           {Array.from({length: 5}).map((_, i) => (
             <div key={i} className="opacity-50">{'>'} {logs[i] || '...'}</div>
           ))}
           <div className="text-white mt-2">{'>'} {text}</div>
        </div>
      </div>
      <button 
        onClick={onComplete}
        className="mt-8 text-xs text-gray-600 hover:text-white transition-colors uppercase border-b border-transparent hover:border-white"
      >
        [ Skip Boot Sequence ]
      </button>
    </div>
  );
};

export default BootSequence;