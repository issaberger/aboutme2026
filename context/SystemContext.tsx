import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaletteName, ThemeColors, Achievement } from '../types';
import { PALETTES, ACHIEVEMENTS_LIST } from '../constants';

interface SystemContextType {
  proMode: boolean;
  toggleProMode: () => void;
  palette: PaletteName;
  setPalette: (p: PaletteName) => void;
  colors: ThemeColors;
  booted: boolean;
  setBooted: (b: boolean) => void;
  achievements: string[];
  unlockAchievement: (id: string) => void;
  overclocked: boolean;
  setOverclocked: (o: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  highScore: number;
  updateHighScore: (score: number) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [proMode, setProMode] = useState(false);
  const [palette, setPaletteState] = useState<PaletteName>('NEON_RAIN');
  const [booted, setBooted] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [overclocked, setOverclocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);

  // Load persistence
  useEffect(() => {
    const savedPro = localStorage.getItem('issa_os_pro_mode');
    if (savedPro) setProMode(JSON.parse(savedPro));

    const savedPalette = localStorage.getItem('issa_os_palette');
    if (savedPalette && PALETTES[savedPalette as PaletteName]) {
      setPaletteState(savedPalette as PaletteName);
    }

    const savedAch = localStorage.getItem('issa_os_achievements');
    if (savedAch) setAchievements(JSON.parse(savedAch));

    const savedScore = localStorage.getItem('issa_os_highscore');
    if (savedScore) setHighScore(parseInt(savedScore, 10));

    const visited = localStorage.getItem('issa_os_visited');
    if (visited) setBooted(true);
    
    // Performance check
    let frameCount = 0;
    let lastTime = performance.now();
    const checkPerf = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        if (frameCount < 20) { // If FPS < 20
             // console.log("Low performance detected, enabling Pro Mode");
             // Optional: auto-enable pro mode if really bad, but might be annoying
        }
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkPerf);
    };
    const animId = requestAnimationFrame(checkPerf);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleProMode = () => {
    const newVal = !proMode;
    setProMode(newVal);
    localStorage.setItem('issa_os_pro_mode', JSON.stringify(newVal));
  };

  const setPalette = (p: PaletteName) => {
    setPaletteState(p);
    localStorage.setItem('issa_os_palette', p);
  };

  const unlockAchievement = (id: string) => {
    if (!achievements.includes(id)) {
      const newAch = [...achievements, id];
      setAchievements(newAch);
      localStorage.setItem('issa_os_achievements', JSON.stringify(newAch));
      // Trigger toast (handled in UI)
    }
  };

  const updateHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('issa_os_highscore', score.toString());
    }
  };

  const toggleSound = () => setSoundEnabled(prev => !prev);

  const colors = PALETTES[palette];

  return (
    <SystemContext.Provider value={{
      proMode, toggleProMode,
      palette, setPalette, colors,
      booted, setBooted,
      achievements, unlockAchievement,
      overclocked, setOverclocked,
      soundEnabled, toggleSound,
      highScore, updateHighScore
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};