import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const { isAdmin } = useAuth();

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Configuración más agresiva para eliminar el delay (mayor stiffness, menor damping/mass)
  const springConfig = { damping: 25, stiffness: 800, mass: 0.1 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Si es admin, nos aseguramos de quitar la clase y no registrar eventos
    if (isAdmin) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    // Activamos la clase que oculta el cursor nativo
    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 100);
    };
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Usamos closest para detectar si el elemento o alguno de sus padres es interactivo
      const isInteractive = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('.cursor-pointer') ||
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, cursorX, cursorY, isAdmin]);

  if (typeof window === 'undefined' || isAdmin) return null;

  return (
    <motion.div
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        left: 0,
        top: 0,
        pointerEvents: 'none',
        position: 'fixed',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
      }}
      animate={{
        scale: isClicking ? 0.9 : isHovering ? 1.4 : 1,
      }}
      className="hidden md:flex items-center justify-center pointer-events-none"
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* Camera Body (Restored detail, small size) */}
        <div 
           className="w-8 h-6 bg-zinc-900 border border-white/30 rounded-sm flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-colors relative"
           style={{ backgroundColor: isHovering ? 'var(--accent)' : '#121212' }}
        >
          {/* Flash Effect Overlay */}
          <AnimatePresence>
            {showFlash && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-50 rounded-sm"
              />
            )}
          </AnimatePresence>

          {/* Lens */}
          <div className="w-4 h-4 rounded-full border border-white/50 bg-zinc-800 flex items-center justify-center overflow-hidden">
             <div className="w-1.5 h-1.5 rounded-full bg-white/20 relative">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white/60 rounded-full" />
             </div>
          </div>
        </div>
        {/* Flash/Shutter Button */}
        <div className="absolute -top-1 right-1 w-2 h-1.5 bg-zinc-800 border border-white/30 rounded-t-xs" />
        {/* Viewfinder (Restored) */}
        <div className="absolute -top-0.5 left-1 w-2 h-0.5 bg-white/20 rounded-full" />
        
        {/* Focus lines on hover */}
        <AnimatePresence>
          {isHovering && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -inset-4 border border-purple-500/40 rounded-lg"
            >
               <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-500" />
               <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-500" />
               <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-500" />
               <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
