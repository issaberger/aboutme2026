import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Network, Bot, Sparkles, Code, Terminal, Database, Zap, Globe } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

const ICONS = [Brain, Cpu, Network, Bot, Sparkles, Code, Terminal, Database, Zap, Globe];

const FloatingIcons = () => {
  const { colors, proMode, themeMode } = useSystem();
  const [icons, setIcons] = useState<any[]>([]);

  useEffect(() => {
    // Generate random icons
    const newIcons = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      Icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      x: Math.random() * 100, // %
      y: Math.random() * 100, // %
      size: Math.random() * 20 + 10, // 10px to 30px
      duration: Math.random() * 20 + 10, // 10s to 30s
      delay: Math.random() * 5,
      opacity: Math.random() * 0.1 + 0.05, // 0.05 to 0.15
    }));
    setIcons(newIcons);
  }, []);

  if (proMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: themeMode === 'light' ? colors.primary : colors.secondary,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, item.opacity, 0],
            y: [0, -50, -100],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingIcons;
