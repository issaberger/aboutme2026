
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSystem } from '../../context/SystemContext';
import CyberButton from '../ui/CyberButton';
import { Trophy, Play, RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Keyboard, Gamepad2, X, Target, Zap, ChevronLeft, Hexagon, Ghost } from 'lucide-react';
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

// --- SHARED COMPONENTS ---
const MobileControls = ({ onInput }: { onInput: (dir: { x: number, y: number }) => void }) => {
  return (
    <div className="absolute bottom-6 right-6 z-30 grid grid-cols-3 gap-3 md:hidden">
      <div />
      <button 
        className="w-16 h-16 bg-gray-900/80 border border-gray-600 rounded-2xl flex items-center justify-center active:bg-primary active:text-black active:scale-95 transition-all shadow-lg backdrop-blur-md"
        onPointerDown={(e) => { e.preventDefault(); onInput({ x: 0, y: -1 }); }}
      >
        <ArrowUp size={32} />
      </button>
      <div />
      
      <button 
        className="w-16 h-16 bg-gray-900/80 border border-gray-600 rounded-2xl flex items-center justify-center active:bg-primary active:text-black active:scale-95 transition-all shadow-lg backdrop-blur-md"
        onPointerDown={(e) => { e.preventDefault(); onInput({ x: -1, y: 0 }); }}
      >
        <ArrowLeft size={32} />
      </button>
      
      <button 
        className="w-16 h-16 bg-gray-900/80 border border-gray-600 rounded-2xl flex items-center justify-center active:bg-primary active:text-black active:scale-95 transition-all shadow-lg backdrop-blur-md"
        onPointerDown={(e) => { e.preventDefault(); onInput({ x: 0, y: 1 }); }}
      >
        <ArrowDown size={32} />
      </button>
      
      <button 
        className="w-16 h-16 bg-gray-900/80 border border-gray-600 rounded-2xl flex items-center justify-center active:bg-primary active:text-black active:scale-95 transition-all shadow-lg backdrop-blur-md"
        onPointerDown={(e) => { e.preventDefault(); onInput({ x: 1, y: 0 }); }}
      >
        <ArrowRight size={32} />
      </button>
    </div>
  );
};

// --- PACKET RUNNER GAME ---
const PacketRunner = ({ onBack }: { onBack: () => void }) => {
  // ... (Existing implementation preserved for brevity, logic identical to previous version)
  const { colors, updateHighScore } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);
  const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_runner_high') || '0'));

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
const NeuralTyper = ({ onBack }: { onBack: () => void }) => {
  // ... (Existing implementation preserved for brevity)
  // Re-use logic from previous file content
  const { colors, updateHighScore } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [category, setCategory] = useState<keyof typeof WORD_CATEGORIES>('CODE');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_typer_high') || '0'));

  const stateRef = useRef({
    words: [] as any[],
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ... (Helper functions like spawnWord, fireProjectile remain same)
  const spawnWord = (canvasWidth: number) => {
      const list = WORD_CATEGORIES[category];
      const text = list[Math.floor(Math.random() * list.length)];
      const x = Math.random() * (canvasWidth - 100) + 50;
      stateRef.current.words.push({ id: Math.random(), text, x, y: -30, speed: 0.5 + (stateRef.current.level * 0.2), typedIndex: 0, isTarget: false });
  };
  const fireProjectile = (targetX: number, targetY: number) => {
      if (!canvasRef.current) return;
      stateRef.current.projectiles.push({ x: canvasRef.current.width / 2, y: canvasRef.current.height, targetX, targetY, speed: 25, color: colors.secondary });
  };
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) stateRef.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1.0, color });
  };

  // ... (Effects for loop and input remain same)
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
          
          state.spawnTimer += deltaTime;
          if (state.spawnTimer > Math.max(800, 2500 - (state.level * 200))) { state.spawnTimer = 0; spawnWord(canvas.width); }

          // Logic updates (move words, projectiles, collision)
          state.words.forEach(w => w.y += w.speed);
          state.words = state.words.filter(w => {
              if (w.y > canvas.height) { state.isPlaying = false; setGameState('GAME_OVER'); updateHighScore(state.score); }
              return w.y <= canvas.height;
          });
          state.projectiles.forEach((p, i) => {
               const dx = p.targetX - p.x, dy = p.targetY - p.y;
               const dist = Math.sqrt(dx*dx + dy*dy);
               if (dist < p.speed) state.projectiles.splice(i, 1);
               else { p.x += (dx/dist)*p.speed; p.y += (dy/dist)*p.speed; }
          });
          state.particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; if (p.life <= 0) state.particles.splice(i, 1); });

          // Draw
          ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
          // ... (Draw grid, gun, projectiles, words, particles)
          ctx.strokeStyle = `${colors.primary}10`;
          ctx.beginPath(); for(let x=0;x<canvas.width;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,canvas.height)} ctx.stroke();
          
          state.words.forEach(w => {
              ctx.font = 'bold 16px "JetBrains Mono", monospace';
              const fullW = ctx.measureText(w.text).width;
              ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.roundRect(w.x-fullW/2-8, w.y-18, fullW+16, 24, 4); ctx.fill();
              if (w.isTarget) { ctx.strokeStyle = colors.secondary; ctx.stroke(); }
              const typed = w.text.substring(0, w.typedIndex);
              const remaining = w.text.substring(w.typedIndex);
              ctx.textAlign = 'center';
              ctx.fillStyle = colors.secondary; ctx.fillText(typed, w.x - ctx.measureText(remaining).width/2, w.y);
              ctx.fillStyle = '#fff'; ctx.fillText(remaining, w.x + ctx.measureText(typed).width/2, w.y);
          });
          
          state.particles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill(); });
          ctx.globalAlpha = 1;
          
          frameId = requestAnimationFrame(render);
      };
      if (gameState === 'PLAYING') frameId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(frameId);
  }, [gameState, colors]);

  const handleInput = (char: string) => {
    if (gameState !== 'PLAYING') return;
    const C = char.toUpperCase();
    const state = stateRef.current;
    let target = state.words.find(w => w.id === state.targetWordId);
    if (!target) {
        const matches = state.words.filter(w => w.text.startsWith(C));
        if (matches.length) { matches.sort((a, b) => b.y - a.y); target = matches[0]; state.targetWordId = target.id; target.isTarget = true; }
    }
    if (target && target.text[target.typedIndex] === C) {
        target.typedIndex++; fireProjectile(target.x, target.y);
        if (target.typedIndex >= target.text.length) {
            state.score += 10 + target.text.length * 5; setScore(state.score);
            state.words = state.words.filter(w => w.id !== target!.id); state.targetWordId = null;
            createExplosion(target.x, target.y, colors.secondary);
        }
    }
  };

  useEffect(() => {
      const kd = (e: KeyboardEvent) => { if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) handleInput(e.key); };
      window.addEventListener('keydown', kd); return () => window.removeEventListener('keydown', kd);
  }, [gameState]);

  return (
    <div className="h-full w-full relative overflow-hidden font-mono" onClick={() => inputRef.current?.focus()}>
        <canvas ref={canvasRef} className="w-full h-full block" />
        <input ref={inputRef} className="absolute opacity-0 top-0 left-0 w-0 h-0" onChange={e => { if (e.target.value) handleInput(e.target.value.slice(-1)); e.target.value=''; }} />
        <button onClick={onBack} className="absolute top-4 left-4 z-20 p-2 bg-black/50 border border-gray-700 rounded text-gray-400 hover:text-white"><ChevronLeft /></button>
        {gameState === 'START' && <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10"><h1 className="text-4xl font-black text-white mb-2">NEURAL TYPER</h1><CyberButton onClick={startGame}>INITIALIZE</CyberButton></div>}
        {gameState === 'GAME_OVER' && <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-6 text-center z-10"><h2 className="text-2xl font-bold text-white mb-4">GAME OVER: {score}</h2><CyberButton onClick={startGame}>RETRY</CyberButton></div>}
    </div>
  );
};

// --- NEURAL SNAKE GAME ---
const NeuralSnake = ({ onBack }: { onBack: () => void }) => {
  const { colors, updateHighScore } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);
  const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_snake_high') || '0'));

  const GRID_SIZE = 20;
  const INITIAL_SPEED = 150;

  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    score: 0,
    speed: INITIAL_SPEED,
    isPlaying: false,
    lastTick: 0
  });

  const generateFood = (snake: {x:number, y:number}[], cols: number, rows: number) => {
    let newFood;
    while(true) {
        newFood = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        if (!snake.some(s => s.x === newFood!.x && s.y === newFood!.y)) break;
    }
    return newFood;
  };

  const startGame = () => {
    stateRef.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: { x: 5, y: 5 },
      score: 0,
      speed: INITIAL_SPEED,
      isPlaying: true,
      lastTick: 0
    };
    setScore(0);
    setGameState('PLAYING');
  };

  // Input Handling
  const handleInput = (dir: { x: number, y: number }) => {
      if (gameState !== 'PLAYING') return;
      const state = stateRef.current;
      // Prevent reversing
      if (dir.x !== 0 && state.direction.x !== 0) return;
      if (dir.y !== 0 && state.direction.y !== 0) return;
      state.nextDirection = dir;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = (time: number) => {
      const state = stateRef.current;
      if (!state.isPlaying) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const cols = Math.floor(canvas.width / GRID_SIZE);
      const rows = Math.floor(canvas.height / GRID_SIZE);

      if (time - state.lastTick > state.speed) {
          state.lastTick = time;
          state.direction = state.nextDirection;
          
          const newHead = {
              x: state.snake[0].x + state.direction.x,
              y: state.snake[0].y + state.direction.y
          };

          // Wrap around logic for better gameplay
          if (newHead.x < 0) newHead.x = cols - 1;
          if (newHead.x >= cols) newHead.x = 0;
          if (newHead.y < 0) newHead.y = rows - 1;
          if (newHead.y >= rows) newHead.y = 0;

          // Self Collision
          const hitSelf = state.snake.some(s => s.x === newHead.x && s.y === newHead.y);

          if (hitSelf) {
              state.isPlaying = false;
              setGameState('GAME_OVER');
              updateHighScore(state.score);
              if (state.score > localHigh) {
                  setLocalHigh(state.score);
                  localStorage.setItem('issa_os_snake_high', state.score.toString());
              }
              return;
          }

          state.snake.unshift(newHead);

          if (newHead.x === state.food.x && newHead.y === state.food.y) {
              state.score += 10;
              setScore(state.score);
              state.food = generateFood(state.snake, cols, rows);
              state.speed = Math.max(50, INITIAL_SPEED - Math.floor(state.score / 20) * 5);
          } else {
              state.snake.pop();
          }
      }

      // Draw
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = `${colors.primary}05`;
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Food
      ctx.fillStyle = colors.secondary;
      ctx.shadowBlur = 15;
      ctx.shadowColor = colors.secondary;
      ctx.fillRect(state.food.x * GRID_SIZE + 2, state.food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

      // Snake
      state.snake.forEach((s, i) => {
          ctx.fillStyle = i === 0 ? colors.primary : `${colors.primary}CC`;
          ctx.shadowBlur = i === 0 ? 15 : 0;
          ctx.shadowColor = colors.primary;
          ctx.fillRect(s.x * GRID_SIZE + 1, s.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (gameState !== 'PLAYING') return;
        if (e.key === 'ArrowUp' || e.key === 'w') handleInput({ x: 0, y: -1 });
        if (e.key === 'ArrowDown' || e.key === 's') handleInput({ x: 0, y: 1 });
        if (e.key === 'ArrowLeft' || e.key === 'a') handleInput({ x: -1, y: 0 });
        if (e.key === 'ArrowRight' || e.key === 'd') handleInput({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  return (
    <div className="h-full w-full relative overflow-hidden select-none font-mono">
       <canvas ref={canvasRef} className="w-full h-full block" />
       
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
               <h1 className="text-4xl md:text-6xl font-black text-white mb-2">NEURAL SNAKE</h1>
               <p className="text-sm text-gray-400 mb-8 max-w-md">Harvest data packets. Avoid grid collision. Control with WASD or Arrows.</p>
               <CyberButton onClick={startGame}><Play size={18} /> INITIALIZE</CyberButton>
           </div>
       )}

       {gameState === 'GAME_OVER' && (
           <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
               <h2 className="text-red-300 font-bold mb-2 animate-pulse">SNAKE.EXE CRASHED</h2>
               <div className="text-4xl font-black text-white mb-6">SCORE: {score}</div>
               <CyberButton variant="secondary" onClick={startGame}><RotateCcw size={18} /> RESTART</CyberButton>
           </div>
       )}

       {/* Mobile Controls */}
       {gameState === 'PLAYING' && <MobileControls onInput={handleInput} />}
    </div>
  );
};

// --- CYBER PAC GAME ---
const PAC_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0], 
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [1,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,1], 
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const CyberPac = ({ onBack }: { onBack: () => void }) => {
    const { colors, updateHighScore } = useSystem();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('START');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [localHigh, setLocalHigh] = useState(parseInt(localStorage.getItem('issa_os_pac_high') || '0'));
    
    // Config
    const SPEED = 0.12; 

    const stateRef = useRef({
        grid: [] as number[][],
        player: { x: 9.5, y: 16, dir: { x: -1, y: 0 }, nextDir: { x: -1, y: 0 }, mouth: 0 },
        ghosts: [
            { x: 9, y: 8, color: '#ef4444', dir: { x: 0, y: 0 }, type: 'chase', mode: 'scatter' }, // Red
            { x: 8, y: 10, color: '#ec4899', dir: { x: 0, y: -1 }, type: 'ambush', mode: 'scatter' }, // Pink
            { x: 10, y: 10, color: '#06b6d4', dir: { x: 0, y: -1 }, type: 'patrol', mode: 'scatter' }, // Cyan
            { x: 9, y: 10, color: '#f97316', dir: { x: 0, y: -1 }, type: 'random', mode: 'scatter' } // Orange
        ],
        particles: [] as Particle[],
        score: 0,
        powerModeTime: 0,
        gameTime: 0
    });

    // Reset Level Logic
    const resetLevel = (fullReset = false) => {
        const state = stateRef.current;
        if (fullReset) {
            // Deep copy map
            state.grid = PAC_MAP.map(row => [...row]);
            state.score = 0;
            setScore(0);
            setLives(3);
        }
        state.player = { x: 9, y: 12, dir: { x: -1, y: 0 }, nextDir: { x: -1, y: 0 }, mouth: 0 };
        state.ghosts = [
            { x: 9, y: 7, color: '#ef4444', dir: { x: 1, y: 0 }, type: 'chase', mode: 'scatter' },
            { x: 8, y: 9, color: '#ec4899', dir: { x: -1, y: 0 }, type: 'ambush', mode: 'scatter' },
            { x: 10, y: 9, color: '#06b6d4', dir: { x: 1, y: 0 }, type: 'patrol', mode: 'scatter' },
            { x: 9, y: 9, color: '#f97316', dir: { x: -1, y: 0 }, type: 'random', mode: 'scatter' }
        ];
        state.particles = [];
        state.powerModeTime = 0;
    };

    const startGame = () => {
        resetLevel(true);
        setGameState('PLAYING');
    };

    const handleInput = useCallback((dir: { x: number, y: number }) => {
        if (gameState !== 'PLAYING') return;
        stateRef.current.player.nextDir = dir;
    }, [gameState]);

    // Keyboard & Swipe Controls
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w') handleInput({ x: 0, y: -1 });
            if (e.key === 'ArrowDown' || e.key === 's') handleInput({ x: 0, y: 1 });
            if (e.key === 'ArrowLeft' || e.key === 'a') handleInput({ x: -1, y: 0 });
            if (e.key === 'ArrowRight' || e.key === 'd') handleInput({ x: 1, y: 0 });
        };
        window.addEventListener('keydown', handleKey);
        
        // Touch Swipe
        let touchStartX = 0;
        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };
        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
                handleInput({ x: dx > 0 ? 1 : -1, y: 0 });
            } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
                handleInput({ x: 0, y: dy > 0 ? 1 : -1 });
            }
        };

        const c = canvasRef.current;
        c?.addEventListener('touchstart', handleTouchStart);
        c?.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKey);
            c?.removeEventListener('touchstart', handleTouchStart);
            c?.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameState, handleInput]);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const checkWall = (x: number, y: number) => {
             const row = Math.round(y);
             const col = Math.round(x);
             // Bounds
             if (row < 0 || row >= PAC_MAP.length || col < 0 || col >= PAC_MAP[0].length) {
                 // Allow tunnel
                 if (col < 0 || col >= PAC_MAP[0].length) return false; 
                 return true; 
             }
             return stateRef.current.grid[row][col] === 1;
        };

        const createParticles = (x: number, y: number, color: string, count = 5) => {
             for(let i=0; i<count; i++) {
                 stateRef.current.particles.push({
                     x, y,
                     vx: (Math.random() - 0.5) * 0.1,
                     vy: (Math.random() - 0.5) * 0.1,
                     life: 1.0,
                     color
                 });
             }
        };

        const moveEntity = (entity: any, speed: number) => {
            // "Cornering" logic: snap to grid center before turning
            const px = entity.x;
            const py = entity.y;
            
            const centerX = Math.round(px);
            const centerY = Math.round(py);
            
            const distToCenter = Math.sqrt((px - centerX)**2 + (py - centerY)**2);
            
            // If near center, try to apply nextDir
            if (entity.nextDir && distToCenter < speed) {
                if (!checkWall(centerX + entity.nextDir.x, centerY + entity.nextDir.y)) {
                    entity.x = centerX;
                    entity.y = centerY;
                    entity.dir = entity.nextDir;
                    entity.nextDir = null; // Consumed
                }
            }
            
            // Move
            if (!checkWall(entity.x + entity.dir.x * 0.6, entity.y + entity.dir.y * 0.6)) {
                entity.x += entity.dir.x * speed;
                entity.y += entity.dir.y * speed;
            } else {
                // Hit wall, snap to center to look clean
                entity.x = Math.round(entity.x);
                entity.y = Math.round(entity.y);
            }

            // Tunnel Wrapping
            if (entity.x < -0.5) entity.x = PAC_MAP[0].length - 0.5;
            if (entity.x > PAC_MAP[0].length - 0.5) entity.x = -0.5;
        };

        const render = (time: number) => {
            if (gameState !== 'PLAYING') return;
            const state = stateRef.current;
            state.gameTime++;

            // AI State Machine
            if (state.powerModeTime > 0) {
                state.powerModeTime--;
            } else {
                // Wave System: 7s Chase, 20s Scatter
                const wave = (state.gameTime / 60) % 27;
                const newMode = wave < 7 ? 'scatter' : 'chase';
                state.ghosts.forEach(g => { if (g.mode !== 'frightened') g.mode = newMode; });
            }

            // Player Update
            moveEntity(state.player, SPEED);

            // Eat Check
            const pgx = Math.round(state.player.x);
            const pgy = Math.round(state.player.y);
            
            // Bounds check before accessing grid
            if (pgy >= 0 && pgy < state.grid.length && pgx >= 0 && pgx < state.grid[0].length) {
                 const cell = state.grid[pgy][pgx];
                 if (cell === 2) { // Dot
                     state.grid[pgy][pgx] = 0;
                     state.score += 10;
                     setScore(state.score);
                     // Visuals only: don't spawn particles every dot to save perf on mobile
                 } else if (cell === 3) { // Power
                     state.grid[pgy][pgx] = 0;
                     state.score += 50;
                     setScore(state.score);
                     state.powerModeTime = 600; 
                     state.ghosts.forEach(g => g.mode = 'frightened');
                     createParticles(state.player.x, state.player.y, '#ffffff', 20);
                 }
            }

            // Check Win
            if (!state.grid.some(row => row.includes(2))) {
                setGameState('WIN');
                updateHighScore(state.score);
            }

            // Ghost Update
            state.ghosts.forEach(g => {
                const gSpeed = g.mode === 'frightened' ? SPEED * 0.5 : SPEED * 0.9;
                
                // Simple AI: Decide direction at intersections
                const gx = Math.round(g.x);
                const gy = Math.round(g.y);
                const dist = Math.sqrt((g.x - gx)**2 + (g.y - gy)**2);

                if (dist < gSpeed) {
                    g.x = gx; g.y = gy; // Snap
                    
                    // Available moves excluding reverse
                    const opts = [
                        {x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}
                    ].filter(d => 
                        !(d.x === -g.dir.x && d.y === -g.dir.y) && 
                        !checkWall(gx + d.x, gy + d.y)
                    );

                    if (opts.length > 0) {
                        let tx = state.player.x, ty = state.player.y;
                        
                        if (g.mode === 'scatter') {
                            if (g.type === 'chase') { tx = 1; ty = 1; } // Top Left
                            else if (g.type === 'ambush') { tx = 18; ty = 1; }
                            else if (g.type === 'patrol') { tx = 1; ty = 18; }
                            else { tx = 18; ty = 18; }
                        }
                        
                        if (g.mode === 'frightened') {
                            // Random move
                            g.dir = opts[Math.floor(Math.random() * opts.length)];
                        } else {
                            // Minimize distance to target
                            g.dir = opts.reduce((best, curr) => {
                                const db = (gx + best.x - tx)**2 + (gy + best.y - ty)**2;
                                const dc = (gx + curr.x - tx)**2 + (gy + curr.y - ty)**2;
                                return dc < db ? curr : best;
                            });
                        }
                    } else {
                        // Dead end, reverse
                        g.dir = { x: -g.dir.x, y: -g.dir.y };
                    }
                }

                g.x += g.dir.x * gSpeed;
                g.y += g.dir.y * gSpeed;

                 // Tunnel
                if (g.x < -0.5) g.x = PAC_MAP[0].length - 0.5;
                if (g.x > PAC_MAP[0].length - 0.5) g.x = -0.5;
            });

            // Collision Player vs Ghost
            for (let g of state.ghosts) {
                if (Math.abs(g.x - state.player.x) < 0.6 && Math.abs(g.y - state.player.y) < 0.6) {
                    if (g.mode === 'frightened') {
                        // Eat Ghost
                        g.x = 9; g.y = 9; g.mode = 'scatter';
                        state.score += 200; setScore(state.score);
                        createParticles(g.x, g.y, g.color, 15);
                    } else {
                        // Die
                        createParticles(state.player.x, state.player.y, '#ffff00', 30);
                        if (lives > 1) {
                            setLives(l => l - 1);
                            // Soft reset positions
                            state.player.x = 9; state.player.y = 12;
                            state.ghosts.forEach((gh, i) => { gh.x = 9 + (i%2); gh.y = 7 + i; });
                        } else {
                            setGameState('GAME_OVER');
                            updateHighScore(state.score);
                            if (state.score > localHigh) {
                                setLocalHigh(state.score);
                                localStorage.setItem('issa_os_pac_high', state.score.toString());
                            }
                        }
                    }
                }
            }

            // Rendering
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const mapW = PAC_MAP[0].length;
            const mapH = PAC_MAP.length;
            const scale = Math.min(canvas.width / mapW, canvas.height / mapH);
            const ox = (canvas.width - mapW * scale) / 2;
            const oy = (canvas.height - mapH * scale) / 2;

            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.translate(ox, oy);
            ctx.scale(scale, scale);

            // Draw Map
            state.grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === 1) {
                        ctx.fillStyle = '#0f172a';
                        ctx.strokeStyle = colors.primary;
                        ctx.lineWidth = 0.05;
                        ctx.strokeRect(x, y, 1, 1);
                        // Make walls look like neon tubes
                        ctx.shadowBlur = 5; ctx.shadowColor = colors.primary;
                        ctx.fillRect(x + 0.2, y + 0.2, 0.6, 0.6);
                        ctx.shadowBlur = 0;
                    } else if (cell === 2) {
                        ctx.fillStyle = '#fbbf24';
                        ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 0.1, 0, Math.PI*2); ctx.fill();
                    } else if (cell === 3) {
                        ctx.fillStyle = '#ffffff';
                        ctx.shadowBlur = 5; ctx.shadowColor = '#fff';
                        ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 0.25, 0, Math.PI*2); ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            });

            // Draw Particles
            state.particles.forEach((p, i) => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath(); ctx.arc(p.x + 0.5, p.y + 0.5, 0.1, 0, Math.PI*2); ctx.fill();
                p.x += p.vx; p.y += p.vy; p.life -= 0.05;
                if (p.life <= 0) state.particles.splice(i, 1);
            });
            ctx.globalAlpha = 1;

            // Draw Player
            const p = state.player;
            ctx.fillStyle = '#fbbf24';
            ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
            ctx.beginPath();
            const mouth = 0.25 * Math.sin(state.gameTime * 0.2) + 0.25;
            const angle = Math.atan2(p.dir.y, p.dir.x);
            ctx.arc(p.x + 0.5, p.y + 0.5, 0.4, angle + mouth, angle - mouth + Math.PI*2);
            ctx.lineTo(p.x + 0.5, p.y + 0.5);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Ghosts
            state.ghosts.forEach(g => {
                ctx.fillStyle = g.mode === 'frightened' ? '#3b82f6' : g.color;
                ctx.beginPath();
                ctx.arc(g.x + 0.5, g.y + 0.5, 0.4, Math.PI, 0);
                ctx.lineTo(g.x + 0.9, g.y + 0.9);
                ctx.lineTo(g.x + 0.1, g.y + 0.9);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(g.x + 0.35, g.y + 0.4, 0.12, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(g.x + 0.65, g.y + 0.4, 0.12, 0, Math.PI*2); ctx.fill();
                // Pupils
                ctx.fillStyle = '#000';
                const eyeOffX = g.dir.x * 0.05;
                const eyeOffY = g.dir.y * 0.05;
                ctx.beginPath(); ctx.arc(g.x + 0.35 + eyeOffX, g.y + 0.4 + eyeOffY, 0.05, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(g.x + 0.65 + eyeOffX, g.y + 0.4 + eyeOffY, 0.05, 0, Math.PI*2); ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        if (gameState === 'PLAYING') {
            animationFrameId = requestAnimationFrame(render);
        } else {
             ctx.fillStyle = colors.bg; ctx.fillRect(0,0,canvas.width, canvas.height);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, colors, lives]);

    return (
        <div className="h-full w-full relative overflow-hidden select-none font-mono">
            <canvas ref={canvasRef} className="w-full h-full block touch-none" />
            
            <button onClick={onBack} className="absolute top-4 left-4 z-20 p-2 bg-black/50 border border-gray-700 rounded text-gray-400 hover:text-white hover:border-white">
                <ChevronLeft />
            </button>

            <div className="absolute top-4 right-4 z-20 text-right pointer-events-none">
                <div className="flex gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400">LIVES</div>
                        <div className="text-xl font-bold text-red-500 flex gap-1 justify-end">{Array(lives).fill('♥').join('')}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400">SCORE</div>
                        <div className="text-xl font-black text-white">{score.toString().padStart(6, '0')}</div>
                    </div>
                </div>
            </div>

            {gameState === 'START' && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
                    <h1 className="text-4xl md:text-6xl font-black text-yellow-400 mb-2">CYBER PAC</h1>
                    <p className="text-sm text-gray-400 mb-8 max-w-md">Consume data. Avoid Daemons. Swipe or use keys to move.</p>
                    <CyberButton onClick={startGame}><Play size={18} /> INITIALIZE</CyberButton>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
                    <h2 className="text-red-300 font-bold mb-2 animate-pulse">PROCESS TERMINATED</h2>
                    <div className="text-4xl font-black text-white mb-6">SCORE: {score}</div>
                    <CyberButton variant="secondary" onClick={startGame}><RotateCcw size={18} /> RETRY</CyberButton>
                </div>
            )}
            
            {gameState === 'WIN' && (
                <div className="absolute inset-0 bg-green-900/60 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
                    <h2 className="text-green-300 font-bold mb-2 animate-pulse">SYSTEM CLEARED</h2>
                    <div className="text-4xl font-black text-white mb-6">SCORE: {score}</div>
                    <CyberButton variant="primary" onClick={startGame}><RotateCcw size={18} /> NEXT LEVEL</CyberButton>
                </div>
            )}

            {gameState === 'PLAYING' && <MobileControls onInput={handleInput} />}
        </div>
    );
};

// --- MAIN MODULE & MENU ---
const GameModule = () => {
  const { colors } = useSystem();
  const [activeGame, setActiveGame] = useState<'MENU' | 'RUNNER' | 'TYPER' | 'SNAKE' | 'PACMAN'>('MENU');

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                    {/* Runner */}
                    <button 
                       onClick={() => setActiveGame('RUNNER')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-primary transition-all text-left flex flex-col"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[size:20px_20px]" />
                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Gamepad2 size={48} className="text-gray-700 group-hover:text-primary mb-4 transition-colors" />
                            <h3 className="text-xl font-bold text-white group-hover:text-primary">PACKET RUNNER</h3>
                            <p className="text-gray-500 text-xs mt-2 text-center px-4">Infinite runner. Dodge firewalls.</p>
                        </div>
                        <div className="relative z-10 p-3 border-t border-gray-800 bg-black/40 flex justify-between items-center text-[10px] font-mono text-gray-500 group-hover:text-white">
                            <span>DIFF: MED</span>
                            <Play size={12} />
                        </div>
                    </button>

                    {/* Typer */}
                    <button 
                       onClick={() => setActiveGame('TYPER')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-secondary transition-all text-left flex flex-col"
                    >
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Keyboard size={48} className="text-gray-700 group-hover:text-secondary mb-4 transition-colors" />
                            <h3 className="text-xl font-bold text-white group-hover:text-secondary">NEURAL TYPER</h3>
                            <p className="text-gray-500 text-xs mt-2 text-center px-4">Data defense. Type to destroy.</p>
                        </div>
                        <div className="relative z-10 p-3 border-t border-gray-800 bg-black/40 flex justify-between items-center text-[10px] font-mono text-gray-500 group-hover:text-white">
                            <span>DIFF: HARD</span>
                            <Play size={12} />
                        </div>
                    </button>

                    {/* Snake */}
                    <button 
                       onClick={() => setActiveGame('SNAKE')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-accent transition-all text-left flex flex-col"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,var(--color-accent)_1px,transparent_1px)] bg-[size:15px_15px]" />
                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Hexagon size={48} className="text-gray-700 group-hover:text-accent mb-4 transition-colors" />
                            <h3 className="text-xl font-bold text-white group-hover:text-accent">NEURAL SNAKE</h3>
                            <p className="text-gray-500 text-xs mt-2 text-center px-4">Harvest bits. Classic reimagined.</p>
                        </div>
                        <div className="relative z-10 p-3 border-t border-gray-800 bg-black/40 flex justify-between items-center text-[10px] font-mono text-gray-500 group-hover:text-white">
                            <span>DIFF: EASY</span>
                            <Play size={12} />
                        </div>
                    </button>

                     {/* Pacman */}
                     <button 
                       onClick={() => setActiveGame('PACMAN')}
                       className="group relative h-64 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all text-left flex flex-col"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#eab308_1px,transparent_1px),linear-gradient(to_bottom,#eab308_1px,transparent_1px)] bg-[size:30px_30px]" />
                        <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
                            <Ghost size={48} className="text-gray-700 group-hover:text-yellow-500 mb-4 transition-colors" />
                            <h3 className="text-xl font-bold text-white group-hover:text-yellow-500">CYBER PAC</h3>
                            <p className="text-gray-500 text-xs mt-2 text-center px-4">Maze chase. Eat dots. Avoid daemons.</p>
                        </div>
                        <div className="relative z-10 p-3 border-t border-gray-800 bg-black/40 flex justify-between items-center text-[10px] font-mono text-gray-500 group-hover:text-white">
                            <span>DIFF: HARD</span>
                            <Play size={12} />
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

         {activeGame === 'SNAKE' && (
             <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <NeuralSnake onBack={() => setActiveGame('MENU')} />
             </motion.div>
         )}
         
         {activeGame === 'PACMAN' && (
             <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <CyberPac onBack={() => setActiveGame('MENU')} />
             </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default GameModule;
