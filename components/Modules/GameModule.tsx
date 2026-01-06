import React, { useEffect, useRef, useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import CyberButton from '../ui/CyberButton';
import { Trophy, Play, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const GameModule = () => {
  const { colors, highScore, updateHighScore, proMode } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);

  // Game Constants
  const LANE_COUNT = 3;
  const PLAYER_SIZE = 40;
  const INITIAL_SPEED = 5;

  // Refs for game loop to avoid stale state closures
  const stateRef = useRef({
    playerLane: 1, // 0, 1, 2
    obstacles: [] as { x: number, y: number, type: 'WALL' | 'DATA', lane: number }[],
    speed: INITIAL_SPEED,
    score: 0,
    lastTime: 0,
    spawnTimer: 0,
    isPlaying: false,
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, color: string }[]
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

  // Particle System
  const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 10; i++) {
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

    let animationFrameId: number;

    const render = (time: number) => {
      if (!stateRef.current.isPlaying) return;

      const state = stateRef.current;
      const deltaTime = time - state.lastTime;
      state.lastTime = time;

      // Update Canvas Size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const laneWidth = canvas.width / LANE_COUNT;

      // --- UPDATE LOGIC ---
      
      // Speed up
      state.speed += 0.001;
      
      // Spawn Obstacles
      state.spawnTimer += deltaTime;
      if (state.spawnTimer > Math.max(500, 2000 - state.score * 5)) {
         state.spawnTimer = 0;
         const lane = Math.floor(Math.random() * 3);
         const type = Math.random() > 0.3 ? 'WALL' : 'DATA'; // 30% chance of data, 70% wall
         state.obstacles.push({
             x: lane * laneWidth + laneWidth / 2,
             y: -50,
             type,
             lane
         });
      }

      // Move Obstacles & Collision
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.y += state.speed;

          // Hitbox logic
          const hitY = obs.y > canvas.height - 100 && obs.y < canvas.height - 20;
          const hitLane = obs.lane === state.playerLane;

          if (hitY && hitLane) {
              if (obs.type === 'WALL') {
                  // Game Over
                  state.isPlaying = false;
                  setGameState('GAME_OVER');
                  updateHighScore(state.score);
                  createExplosion(obs.x, obs.y, colors.primary);
              } else if (obs.type === 'DATA') {
                  // Collect
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

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.05;
          if (p.life <= 0) state.particles.splice(i, 1);
      }

      // --- DRAW LOGIC ---

      // Clear
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid / Perspective
      ctx.strokeStyle = `${colors.primary}20`;
      ctx.lineWidth = 2;
      
      // Vertical Lane Lines
      for (let i = 1; i < LANE_COUNT; i++) {
          ctx.beginPath();
          ctx.moveTo(i * laneWidth, 0);
          ctx.lineTo(i * laneWidth, canvas.height);
          ctx.stroke();
      }

      // Moving Horizontal Lines (Pseudo-3D)
      const gridOffset = (time * state.speed * 0.5) % 100;
      for (let y = gridOffset; y < canvas.height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
      }

      // Draw Player
      const playerX = state.playerLane * laneWidth + laneWidth / 2;
      const playerY = canvas.height - 60;
      
      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.fillStyle = colors.primary;
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors.primary;
      
      // Draw Triangle Ship
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 20);
      ctx.lineTo(-15, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw Obstacles
      state.obstacles.forEach(obs => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          if (obs.type === 'WALL') {
              ctx.fillStyle = '#ef4444'; // Red
              ctx.shadowBlur = 15;
              ctx.shadowColor = '#ef4444';
              ctx.fillRect(-20, -20, 40, 40);
              // X mark
              ctx.strokeStyle = '#500000';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(-15, -15);
              ctx.lineTo(15, 15);
              ctx.moveTo(15, -15);
              ctx.lineTo(-15, 15);
              ctx.stroke();
          } else {
              ctx.fillStyle = colors.secondary;
              ctx.shadowBlur = 15;
              ctx.shadowColor = colors.secondary;
              ctx.beginPath();
              ctx.arc(0, 0, 15, 0, Math.PI * 2);
              ctx.fill();
              // Inner detail
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(0, 0, 5, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.restore();
      });

      // Draw Particles
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
        // Static render for start/gameover background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw faint grid
        // ... (can add static background logic here)
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, colors]);

  // Input Handling
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

  // Touch Controls
  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      // Determine if left or right side of screen
      let clientX = 0;
      if ('touches' in e) {
         clientX = e.touches[0].clientX;
      } else {
         clientX = (e as React.MouseEvent).clientX;
      }
      
      const width = window.innerWidth;
      if (clientX < width / 2) {
         stateRef.current.playerLane = Math.max(0, stateRef.current.playerLane - 1);
      } else {
         stateRef.current.playerLane = Math.min(2, stateRef.current.playerLane + 1);
      }
  };

  return (
    <div className="h-full w-full relative overflow-hidden select-none">
       {/* Game Canvas */}
       <canvas 
         ref={canvasRef}
         className="w-full h-full block cursor-crosshair"
         onMouseDown={handleTouch}
         onTouchStart={handleTouch}
       />

       {/* UI Overlay */}
       <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-start pointer-events-none">
           <div>
               <h3 className="text-xs font-mono text-gray-400">SCORE</h3>
               <div className="text-4xl font-black text-white font-cyber tracking-widest">{score.toString().padStart(6, '0')}</div>
           </div>
           <div className="text-right">
               <h3 className="text-xs font-mono text-gray-400">HIGH SCORE</h3>
               <div className="text-2xl font-bold text-primary flex items-center justify-end gap-2">
                   <Trophy size={16} /> {highScore.toString().padStart(6, '0')}
               </div>
           </div>
       </div>

       {/* Start Screen */}
       {gameState === 'START' && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
               <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                   PACKET <span style={{ color: colors.primary }}>RUNNER</span>
               </h1>
               <p className="max-w-md text-gray-400 mb-8 font-mono text-sm">
                   Navigate the data stream. Avoid <span className="text-red-500">FIREWALLS</span>. Collect <span style={{ color: colors.secondary }}>DATA FRAGMENTS</span>.
               </p>
               
               <div className="flex gap-4 mb-8">
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 border border-gray-600 rounded flex items-center justify-center text-gray-400 bg-gray-900"><ArrowLeft /></div>
                       <span className="text-[10px] uppercase text-gray-600">Left</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 border border-gray-600 rounded flex items-center justify-center text-gray-400 bg-gray-900"><ArrowRight /></div>
                       <span className="text-[10px] uppercase text-gray-600">Right</span>
                   </div>
               </div>

               <CyberButton onClick={startGame}>
                   <Play size={18} /> INITIALIZE RUN
               </CyberButton>
           </div>
       )}

       {/* Game Over Screen */}
       {gameState === 'GAME_OVER' && (
           <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-md">
               <h2 className="text-red-500 font-mono tracking-[0.5em] text-lg mb-2 animate-pulse">CONNECTION TERMINATED</h2>
               <h1 className="text-6xl font-black text-white mb-2">GAME OVER</h1>
               <div className="text-2xl text-white mb-8">
                   FINAL SCORE: <span style={{ color: colors.primary }}>{score}</span>
               </div>
               <CyberButton variant="secondary" onClick={startGame}>
                   <RotateCcw size={18} /> RE-ESTABLISH LINK
               </CyberButton>
           </div>
       )}
    </div>
  );
};

export default GameModule;