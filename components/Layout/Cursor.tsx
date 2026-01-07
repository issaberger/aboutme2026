import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

const Cursor = () => {
  const { proMode, colors } = useSystem();
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const handleLinkHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('button') || target.closest('a')) {
        setLinkHovered(true);
      }
    };

    const handleLinkHoverEnd = () => {
      setLinkHovered(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    // Use event delegation for hover detection
    document.addEventListener('mouseover', handleLinkHoverStart);
    document.addEventListener('mouseout', handleLinkHoverEnd);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleLinkHoverStart);
      document.removeEventListener('mouseout', handleLinkHoverEnd);
    };
  }, [cursorX, cursorY]);

  if (proMode) return null;

  return (
    <>
      <MotionDiv
        className="fixed top-0 left-0 w-8 h-8 border border-primary rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          borderColor: colors.primary
        } as any} // Fix: Cast style to any to support motion values
        animate={{
          scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
          rotate: linkHovered ? 45 : 0
        }}
      >
        <div className={`w-1 h-1 bg-current rounded-full ${linkHovered ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundColor: colors.primary }} />
      </MotionDiv>
      {/* Trail effect */}
      <MotionDiv 
         className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9998] opacity-50"
         style={{
             x: cursorX,
             y: cursorY,
             backgroundColor: colors.secondary,
             translateX: 12,
             translateY: 12
         } as any} // Fix: Cast style to any to support motion values
         transition={{ duration: 0.1 }}
      />
    </>
  );
};

export default Cursor;