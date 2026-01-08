
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSystem } from '../../context/SystemContext';
import CyberButton from '../ui/CyberButton';
import { Trophy, Play, RotateCcw, ArrowLeft, ArrowRight, Keyboard, Gamepad2, X, Target, Zap, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHARED TYPES & UTILS ---
const WORD_CATEGORIES: Record<string, string[]> = {
  CODE: ['REACT', 'TYPESCRIPT', 'FUNCTION', 'VARIABLE', 'CONST', 'INTERFACE', 'COMPONENT', 'HOOK', 'PROMISE', 'ASYNC', 'AWAIT', 'IMPORT', 'EXPORT', 'RETURN', 'CLASS', 'VOID', 'NULL', 'UNDEFINED', 'OBJECT', 'ARRAY', 'STRING', 'NUMBER', 'BOOLEAN', 'ANY', 'UNKNOWN', 'NEVER', 'ENUM', 'TYPE', 'MODULE', 'PACKAGE'],
  HACKER: ['MAINFRAME', 'FIREWALL', 'ENCRYPTION', 'CIPHER', 'DECRYPT', 'PAYLOAD', 'EXPLOIT', 'ZERODAY', 'PHISHING', 'BRUTEFORCE', 'ROOTKIT', 'DAEMON', 'PROXY', 'BACKDOOR', 'INJECT', 'SPOOF', 'SNIFFER', 'BOTNET', 'RANSOMWARE', 'KEYLOGGER', 'DDOS', 'TROJAN', 'WORM', 'VIRUS', 'MALWARE', 'SPYWARE', 'ADWARE', 'LOGICBOMB'],
  SYSTEM: ['KERNEL', 'DRIVER', 'MEMORY', 'PROCESS', 'THREAD', 'BUFFER', 'REGISTRY', 'BIOS', 'BOOT', 'TERMINAL', 'SHELL', 'SUDO', 'SERVER', 'CLIENT', 'SOCKET', 'PORT', 'LATENCY', 'BANDWIDTH', 'PROTOCOL', 'NETWORK', 'IP', 'DNS', 'DHCP', 'TCP', 'UDP', 'HTTP', 'SSH', 'FTP', 'SMTP']
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// --- PACKET RUNNER GAME ---
const PacketRunner = ({ onBack }: { onBack: () => void }) => {
  const { colors, updateHighScore } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);
  const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_runner_high') || '0'));

  // Game Constants
  const LANE_COUNT = 3;
  const INITIAL_SPEED = 5;

  const stateRef = useRef({
    playerLane: 1,
    obstacles: [] as { x: number, y: number, type: 'WALL' | 'DATA', lane: number }[],
    speed: INITIAL_SPEED,
    score: 0,
    lastTime: 0,
    spawnTimer: 0,
    isPlaying: false,
    particles: [] as Particle[]
  });

  const startGame = () => {
    stateRef.current = {
      playerLane: 1,
      obstacles: [],
      speed: INITIAL_SPEED,
      score: 0,
      lastTime: performance.now(),
      spawnTimer: 0,
      isPlaying: true,
      particles: []
    };
    setScore(0);
    setGameState('PLAYING');
  };

  const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 15; i++) {
          stateRef.current.particles.push({
              x, y,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              life: 1.0,
              color
          });
      }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (time: number) => {
      if (!stateRef.current.isPlaying) return;

      const state = stateRef.current;
      const deltaTime = time - state.lastTime;
      state.lastTime = time;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const laneWidth = canvas.width / LANE_COUNT;

      // Update Logic
      state.speed += 0.002;
      state.spawnTimer += deltaTime;
      if (state.spawnTimer > Math.max(400, 2000 - state.score * 5)) {
         state.spawnTimer = 0;
         const lane = Math.floor(Math.random() * 3);
         const type = Math.random() > 0.3 ? 'WALL' : 'DATA'; 
         state.obstacles.push({
             x: lane * laneWidth + laneWidth / 2,
             y: -50,
             type,
             lane
         });
      }

      for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.y += state.speed;

          const hitY = obs.y > canvas.height - 120 && obs.y < canvas.height - 20;
          const hitLane = obs.lane === state.playerLane;

          if (hitY && hitLane) {
              if (obs.type === 'WALL') {
                  state.isPlaying = false;
                  setGameState('GAME_OVER');
                  const finalScore = state.score;
                  updateHighScore(finalScore);
                  if (finalScore > localHigh) {
                      setLocalHigh(finalScore);
                      localStorage.setItem('issa_os_runner_high', finalScore.toString());
                  }
                  createExplosion(obs.x, obs.y, colors.primary);
              } else if (obs.type === 'DATA') {
                  state.score += 50;
                  setScore(state.score);
                  state.obstacles.splice(i, 1);
                  createExplosion(obs.x, obs.y, colors.secondary);
                  continue;
              }
          }

          if (obs.y > canvas.height) {
              if (obs.type === 'WALL') {
                  state.score += 10;
                  setScore(state.score);
              }
              state.obstacles.splice(i, 1);
          }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.05;
          if (p.life <= 0) state.particles.splice(i, 1);
      }

      // Draw
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = `${colors.primary}20`;
      ctx.lineWidth = 2;
      for (let i = 1; i < LANE_COUNT; i++) {
          ctx.beginPath();
          ctx.moveTo(i * laneWidth, 0);
          ctx.lineTo(i * laneWidth, canvas.height);
          ctx.stroke();
      }

      const gridOffset = (time * state.speed * 0.5) % 100;
      for (let y = gridOffset; y < canvas.height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
      }

      const playerX = state.playerLane * laneWidth + laneWidth / 2;
      const playerY = canvas.height - 80;
      
      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.fillStyle = colors.primary;
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors.primary;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 20);
      ctx.lineTo(-15, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      state.obstacles.forEach(obs => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          if (obs.type === 'WALL') {
              ctx.fillStyle = '#ef4444'; 
              ctx.shadowBlur = 15;
              ctx.shadowColor = '#ef4444';
              ctx.fillRect(-20, -20, 40, 40);
          } else {
              ctx.fillStyle = colors.secondary;
              ctx.shadowBlur = 15;
              ctx.shadowColor = colors.secondary;
              ctx.beginPath();
              ctx.arc(0, 0, 15, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.restore();
      });

      state.particles.forEach(p => {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    if (gameState === 'PLAYING') {
        animationFrameId = requestAnimationFrame(render);
    } else {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, colors]);

  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (gameState !== 'PLAYING') return;
          if (e.key === 'ArrowLeft' || e.key === 'a') {
              stateRef.current.playerLane = Math.max(0, stateRef.current.playerLane - 1);
          }
          if (e.key === 'ArrowRight' || e.key === 'd') {
              stateRef.current.playerLane = Math.min(2, stateRef.current.playerLane + 1);
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      let clientX = 0;
      if ('touches' in e) clientX = e.touches[0].clientX;
      else clientX = (e as React.MouseEvent).clientX;
      const width = window.innerWidth;
      if (clientX < width / 2) stateRef.current.playerLane = Math.max(0, stateRef.current.playerLane - 1);
      else stateRef.current.playerLane = Math.min(2, stateRef.current.playerLane + 1);
  };

  return (
    <div className="h-full w-full relative overflow-hidden select-none font-mono">
       <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" onMouseDown={handleTouch} onTouchStart={handleTouch} />
       
       <button onClick={onBack} className="absolute top-4 left-4 z-20 p-2 bg-black/50 border border-gray-700 rounded text-gray-400 hover:text-white hover:border-white">
          <ChevronLeft />
       </button>

       <div className="absolute top-4 right-4 z-20 text-right pointer-events-none">
           <div className="text-[10px] text-gray-400">SCORE</div>
           <div className="text-2xl font-black text-white">{score.toString().padStart(6, '0')}</div>
           <div className="text-[10px] text-gray-500 mt-1">HIGH: {localHigh}</div>
       </div>

       {gameState === 'START' && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
               <h1 className="text-4xl md:text-6xl font-black text-white mb-2">PACKET RUNNER</h1>
               <p className="text-sm text-gray-400 mb-8 max-w-md">Dodge red firewalls. Collect data fragments. Tap left/right to move.</p>
               <CyberButton onClick={startGame}><Play size={18} /> START RUN</CyberButton>
           </div>
       )}

       {gameState === 'GAME_OVER' && (
           <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
               <h2 className="text-red-300 font-bold mb-2 animate-pulse">CONNECTION TERMINATED</h2>
               <div className="text-4xl font-black text-white mb-6">SCORE: {score}</div>
               <CyberButton variant="secondary" onClick={startGame}><RotateCcw size={18} /> RETRY</CyberButton>
           </div>
       )}
    </div>
  );
};

// --- NEURAL TYPER GAME ---
interface WordObj {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
    typedIndex: number; 
    isTarget: boolean;
}

const NeuralTyper = ({ onBack }: { onBack: () => void }) => {
  const { colors, updateHighScore } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // For mobile keyboard
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [category, setCategory] = useState<keyof typeof WORD_CATEGORIES>('CODE');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_typer_high') || '0'));

  const stateRef = useRef({
    words: [] as WordObj[],
    particles: [] as Particle[],
    projectiles: [] as { x: number, y: number, targetX: number, targetY: number, speed: number, color: string }[],
    score: 0,
    level: 1,
    spawnTimer: 0,
    lastTime: 0,
    isPlaying: false,
    targetWordId: null as number | null
  });

  const startGame = () => {
    stateRef.current = {
      words: [],
      particles: [],
      projectiles: [],
      score: 0,
      level: 1,
      spawnTimer: 0,
      lastTime: performance.now(),
      isPlaying: true,
      targetWordId: null
    };
    setScore(0);
    setLevel(1);
    setGameState('PLAYING');
    // Focus hidden input for mobile
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const spawnWord = (canvasWidth: number) => {
      const list = WORD_CATEGORIES[category];
      const text = list[Math.floor(Math.random() * list.length)];
      // Ensure no overlap logic omitted for brevity, simple random x
      const x = Math.random() * (canvasWidth - 100) + 50;
      
      stateRef.current.words.push({
          id: Math.random(),
          text,
          x,
          y: -30,
          speed: 0.5 + (stateRef.current.level * 0.2), // Speed increases with level
          typedIndex: 0,
          isTarget: false
      });
  };

  const fireProjectile = (targetX: number, targetY: number) => {
      if (!canvasRef.current) return;
      const startX = canvasRef.current.width / 2;
      const startY = canvasRef.current.height;
      
      stateRef.current.projectiles.push({
          x: startX,
          y: startY,
          targetX,
          targetY,
          speed: 25,
          color: colors.secondary
      });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
        stateRef.current.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color
        });
    }
  };

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frameId: number;

      const render = (time: number) => {
          if (!stateRef.current.isPlaying) return;
          const state = stateRef.current;
          const deltaTime = time - state.lastTime;
          state.lastTime = time;

          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;

          // --- UPDATE ---
          
          // Level Up logic
          const newLevel = Math.floor(state.score / 500) + 1;
          if (newLevel !== state.level) {
              state.level = newLevel;
              setLevel(newLevel);
          }

          // Spawn
          state.spawnTimer += deltaTime;
          const spawnRate = Math.max(800, 2500 - (state.level * 200));
          if (state.spawnTimer > spawnRate) {
              state.spawnTimer = 0;
              spawnWord(canvas.width);
          }

          // Move Words
          for (let i = state.words.length - 1; i >= 0; i--) {
              const w = state.words[i];
              w.y += w.speed;
              
              if (w.y > canvas.height) {
                  // Missed word
                  state.isPlaying = false;
                  setGameState('GAME_OVER');
                  updateHighScore(state.score);
                  if (state.score > localHigh) {
                      setLocalHigh(state.score);
                      localStorage.setItem('issa_os_typer_high', state.score.toString());
                  }
              }
          }

          // Move Projectiles
          for (let i = state.projectiles.length - 1; i >= 0; i--) {
             const p = state.projectiles[i];
             const dx = p.targetX - p.x;
             const dy = p.targetY - p.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist < p.speed) {
                 // Hit
                 state.projectiles.splice(i, 1);
             } else {
                 p.x += (dx / dist) * p.speed;
                 p.y += (dy / dist) * p.speed;
             }
          }

          // Move Particles
          for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) state.particles.splice(i, 1);
        }

          // --- DRAW ---
          ctx.fillStyle = colors.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid
          ctx.strokeStyle = `${colors.primary}10`;
          ctx.beginPath();
          for(let x=0; x<canvas.width; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); }
          for(let y=0; y<canvas.height; y+=40) { ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); }
          ctx.stroke();

          // Player Base
          ctx.fillStyle = colors.primary;
          ctx.fillRect(canvas.width/2 - 20, canvas.height - 20, 40, 20);
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height - 20, 15, Math.PI, 0);
          ctx.fill();

          // Projectiles
          state.projectiles.forEach(p => {
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - (p.targetX - p.x)*0.2, p.y - (p.targetY - p.y)*0.2); // Trail
              ctx.stroke();
          });

          // Words
          ctx.font = 'bold 16px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          state.words.forEach(w => {
              const textWidth = ctx.measureText(w.text).width;
              
              // Background pill
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.beginPath();
              ctx.roundRect(w.x - textWidth/2 - 8, w.y - 18, textWidth + 16, 24, 4);
              ctx.fill();
              if (w.isTarget) {
                  ctx.strokeStyle = colors.secondary;
                  ctx.lineWidth = 2;
                  ctx.stroke();
              }

              // Typed part
              const typed = w.text.substring(0, w.typedIndex);
              const remaining = w.text.substring(w.typedIndex);
              
              // Calculate offset to center the combined text
              const fullWidth = ctx.measureText(w.text).width;
              let currentX = w.x - fullWidth / 2;

              ctx.fillStyle = colors.secondary; // Typed color
              ctx.textAlign = 'left';
              ctx.fillText(typed, currentX, w.y);
              currentX += ctx.measureText(typed).width;

              ctx.fillStyle = '#fff'; // Remaining color
              ctx.fillText(remaining, currentX, w.y);
          });

          // Particles
          state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

          frameId = requestAnimationFrame(render);
      };

      if (gameState === 'PLAYING') {
          frameId = requestAnimationFrame(render);
      } else {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return () => cancelAnimationFrame(frameId);
  }, [gameState, colors]);

  const handleInput = (char: string) => {
      if (gameState !== 'PLAYING') return;
      
      const charUpper = char.toUpperCase();
      const state = stateRef.current;
      let target = state.words.find(w => w.id === state.targetWordId);

      // If no target or target destroyed (safety), find new target
      if (!target) {
          // Find word starting with char, prioritize lowest (highest Y)
          const matches = state.words.filter(w => w.text.startsWith(charUpper));
          if (matches.length > 0) {
              matches.sort((a, b) => b.y - a.y); // Closest to bottom
              target = matches[0];
              state.targetWordId = target.id;
              target.isTarget = true;
          }
      }

      if (target) {
          const nextChar = target.text[target.typedIndex];
          if (nextChar === charUpper) {
              target.typedIndex++;
              fireProjectile(target.x, target.y);
              
              if (target.typedIndex >= target.text.length) {
                  // Word Destroyed
                  state.score += 10 + (target.text.length * 5);
                  setScore(state.score);
                  state.words = state.words.filter(w => w.id !== target!.id);
                  state.targetWordId = null;
                  createExplosion(target.x, target.y, colors.secondary);
              }
          } else {
              // Miss/Typo on targeted word - maybe play sound
          }
      }
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
              handleInput(e.key);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
      <div className="h-full w-full relative overflow-hidden select-none font-mono" onClick={() => inputRef.current?.focus()}>
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          {/* Hidden Input for Mobile Keyboard */}
          <input 
            ref={inputRef} 
            className="absolute opacity-0 top-0 left-0 h-0 w-0" 
            autoComplete="off" 
            autoCapitalize="none"
            onChange={(e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    handleInput(val[val.length - 1]);
                    e.target.value = ''; // Reset
                }
            }}
          />

          <button onClick={onBack} className="absolute top-4 left-4 z-20 p-2 bg-black/50 border border-gray-700 rounded text-gray-400 hover:text-white hover:border-white">
             <ChevronLeft />
          </button>

          <div className="absolute top-4 right-4 z-20 text-right pointer-events-none">
             <div className="flex gap-4">
                 <div>
                    <div className="text-[10px] text-gray-400">LEVEL</div>
                    <div className="text-xl font-bold text-primary">{level}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-400">SCORE</div>
                    <div className="text-xl font-black text-white">{score.toString().padStart(6, '0')}</div>
                 </div>
             </div>
          </div>

          {gameState === 'START' && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
                  <h1 className="text-4xl font-black text-white mb-2">NEURAL TYPER</h1>
                  <p className="text-sm text-gray-400 mb-6">Type the falling words to execute them before they breach the firewall.</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-8 w-full max-w-sm">
                      {(Object.keys(WORD_CATEGORIES) as Array<keyof typeof WORD_CATEGORIES>).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`p-2 text-xs font-bold border rounded transition-all ${category === cat ? 'bg-primary text-black border-primary' : 'bg-transparent text-gray-500 border-gray-800'}`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>

                  <CyberButton onClick={startGame}><Keyboard size={18} /> INITIALIZE</CyberButton>
                  <p className="mt-4 text-[10px] text-gray-600">MOBILE: TAP SCREEN TO OPEN KEYBOARD</p>
              </div>
          )}

          {gameState === 'GAME_OVER' && (
              <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
                   <h2 className="text-red-300 font-bold mb-2">SYSTEM BREACHED</h2>
                   <div className="text-4xl font-black text-white mb-2">SCORE: {score}</div>
                   <div className="text-xs text-red-200 mb-6">HIGHSCORE: {localHigh}</div>
                   <CyberButton variant="secondary" onClick={startGame}><RotateCcw size={18} /> REBOOT SYSTEM</CyberButton>
              </div>
          )}
      </div>
  );
};

// --- MAIN MODULE & MENU ---
const GameModule = () => {
  const { colors } = useSystem();
  const [activeGame, setActiveGame] = useState<'MENU' | 'RUNNER' | 'TYPER'>('MENU');

  return (
    <div className="h-full w-full relative bg-bg">
       <AnimatePresence mode="wait">
         {activeGame === 'MENU' && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto"
            >
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">ARCADE <span className="text-primary">NEXUS</span></h2>
                <p className="text-gray-500 mb-12 font-mono text-sm">SELECT SIMULATION PROTOCOL</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    <button 
                       onClick={() => setActiveGame('RUNNER')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-primary transition-all text-left flex flex-col"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[size:20px_20px]" />
                        
                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Gamepad2 size={64} className="text-gray-700 group-hover:text-primary mb-6 transition-colors" />
                            <h3 className="text-2xl font-bold text-white group-hover:text-primary">PACKET RUNNER</h3>
                            <p className="text-gray-500 text-sm mt-2 text-center">Infinite runner. Dodge firewalls. Reflex test.</p>
                        </div>
                        <div className="relative z-10 p-4 border-t border-gray-800 bg-black/40 flex justify-between items-center text-xs font-mono text-gray-500 group-hover:text-white">
                            <span>DIFFICULTY: MED</span>
                            <Play size={14} />
                        </div>
                    </button>

                    <button 
                       onClick={() => setActiveGame('TYPER')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-secondary transition-all text-left flex flex-col"
                    >
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Keyboard size={64} className="text-gray-700 group-hover:text-secondary mb-6 transition-colors" />
                            <h3 className="text-2xl font-bold text-white group-hover:text-secondary">NEURAL TYPER</h3>
                            <p className="text-gray-500 text-sm mt-2 text-center">Data defense. Type to destroy. Speed typing.</p>
                        </div>
                        <div className="relative z-10 p-4 border-t border-gray-800 bg-black/40 flex justify-between items-center text-xs font-mono text-gray-500 group-hover:text-white">
                            <span>DIFFICULTY: HARD</span>
                            <Play size={14} />
                        </div>
                    </button>
                </div>
            </motion.div>
         )}

         {activeGame === 'RUNNER' && (
             <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <PacketRunner onBack={() => setActiveGame('MENU')} />
             </motion.div>
         )}
         
         {activeGame === 'TYPER' && (
             <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <NeuralTyper onBack={() => setActiveGame('MENU')} />
             </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default GameModule;
