import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';

interface CyberButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger';
  glitch?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// Fix: Cast motion.button to any to avoid TypeScript errors with framer-motion props
const MotionButton = motion.button as any;

const CyberButton: React.FC<CyberButtonProps> = ({ 
  children, 
  variant = 'primary', 
  glitch = true,
  className = '',
  ...props 
}) => {
  const { proMode } = useSystem();

  const baseStyles = "relative px-6 py-3 font-bold uppercase tracking-wider text-sm outline-none transition-all duration-200 overflow-hidden group";
  
  const variants = {
    primary: "bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black",
    secondary: "bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white",
    danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
  };

  return (
    <MotionButton
      whileHover={proMode ? {} : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {!proMode && (
        <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_1s_infinite]" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Corner decorations */}
      {!proMode && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
        </>
      )}
    </MotionButton>
  );
};

export default CyberButton;