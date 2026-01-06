import React, { useEffect, useRef } from 'react';
import { useSystem } from '../../context/SystemContext';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colors, proMode } = useSystem();

  useEffect(() => {
    if (proMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Binary characters with occasional glitch chars
    const chars = '10100110101'; 
    const fontSize = 14;
    const columns = Math.ceil(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    
    // Mouse state for interaction
    const mouse = { x: -1000, y: -1000 };
    
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frameId: number;

    const draw = () => {
        // Create trail fade effect
        ctx.fillStyle = hexToRgba(colors.bg, 0.1); 
        ctx.fillRect(0, 0, width, height);

        ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Interaction: Calculate distance to mouse
            const dist = Math.hypot(x - mouse.x, y - mouse.y);
            const isHovered = dist < 100; // Interaction radius

            if (isHovered) {
                // Highlight near mouse
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
            } else {
                // Standard rain with random color glitches
                if (Math.random() > 0.98) {
                    ctx.fillStyle = colors.secondary;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = colors.secondary;
                } else {
                    ctx.fillStyle = colors.primary;
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }
            }

            ctx.fillText(text, x, y);

            // Randomize reset to vary rain speed and pattern
            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
        frameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
    };
  }, [colors, proMode]);

  if (proMode) return null;

  return (
    <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen"
    />
  );
};

export default MatrixBackground;