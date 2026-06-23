'use client';
import { SunIcon, MoonIcon, PaintBrushIcon, ArrowRightStartOnRectangleIcon, EnvelopeIcon, UserIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../utils/AuthContext';
import { useState, useRef } from 'react';
import LoginModal from './LoginModal';

interface HeaderOptionItem {
  title: string;
  ref: React.RefObject<HTMLDivElement | null>;
}

interface HeaderProps {
  headerOptions: HeaderOptionItem[];
}

export default function Header({ headerOptions }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { isAdmin, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleScrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // Hidden Login logic (5s long press)
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLoginOpen(true);
    }, 2000);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const themes = [
    { id: 'light', icon: SunIcon, label: 'Luz' },
    { id: 'dark', icon: MoonIcon, label: 'Noche' },
    { id: 'morado', icon: PaintBrushIcon, label: 'Púrpura' },
  ] as const;

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-40 flex items-center justify-center w-full px-4"
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-fit items-center justify-between mt-5 py-1.5 px-3 sm:px-4 lg:px-6 text-sm font-medium rounded-full backdrop-blur-md shadow-lg transition-colors duration-300 border border-white/10"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)'
        }}
      >
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Icons Section */}
          {headerOptions.map((option) => {
            const isAboutMe = option.title.toLowerCase().includes('sobre') || option.title.toLowerCase().includes('about');
            const isGallery = option.title.toLowerCase().includes('galería') || option.title.toLowerCase().includes('gallery');
            const isHome = option.title.toLowerCase().includes('inicio') || option.title.toLowerCase().includes('home');
            
            const Icon = isHome 
              ? CameraIcon
              : isAboutMe
                ? UserIcon
                : isGallery
                  ? PhotoIcon
                  : EnvelopeIcon;

            return (
              <motion.button
                key={option.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScrollTo(option.ref)}
                onMouseDown={isAboutMe ? startLongPress : undefined}
                onMouseUp={isAboutMe ? endLongPress : undefined}
                onMouseLeave={isAboutMe ? endLongPress : undefined}
                onTouchStart={isAboutMe ? startLongPress : undefined}
                onTouchEnd={isAboutMe ? endLongPress : undefined}
                className="p-2 rounded-2xl transition-all hover:bg-black/5 flex flex-col items-center gap-0.5"
                style={{ color: 'var(--text-main)' }}
                title={option.title}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:block">{option.title}</span>
              </motion.button>
            );
          })}

          <div className="h-8 w-px mx-1" style={{ backgroundColor: 'var(--border)' }} />

          {/* Logout Button (Only visible if Admin, otherwise hidden) */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05, color: '#ef4444' }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-2xl transition-all hover:bg-black/5 flex flex-col items-center gap-0.5"
              style={{ color: 'var(--text-main)' }}
              title="Cerrar sesión"
            >
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:block">Salir</span>
            </motion.button>
          )}

          {/* Theme Button (Always Last) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleTheme}
            className="p-2 rounded-2xl transition-all hover:bg-black/5 flex flex-col items-center gap-0.5"
            style={{ color: 'var(--text-main)' }}
            title={`Cambiar tema (Actual: ${currentTheme.label})`}
          >
            <currentTheme.icon className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:block">{currentTheme.label}</span>
          </motion.button>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </motion.header>
  );
}
