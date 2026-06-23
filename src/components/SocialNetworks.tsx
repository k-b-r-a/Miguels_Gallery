import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function SocialNetworks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Minimalist Floating Toggle Button (Header Aesthetic - 1.5x Larger) */}
      <div className="fixed right-6 bottom-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="p-5 sm:p-6 rounded-full shadow-lg backdrop-blur-md transition-all flex items-center justify-center border border-white/10 group"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
            color: 'var(--text-main)'
          }}
          title="Ver redes sociales"
        >
          <HeartIcon
            className="w-9 h-9 sm:w-11 sm:h-11 group-hover:scale-110 transition-transform"
            style={{ color: 'var(--accent)' }}
          />
        </motion.button>
      </div>

      {/* Immersive Social Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Main Cartel Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]"
              style={{ backgroundColor: 'var(--bg-app)' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-3 rounded-full hover:bg-black/5 transition-colors z-10"
                style={{ color: 'var(--text-main)' }}
              >
                <XMarkIcon className="w-8 h-8" />
              </button>

              {/* Instagram Cartel (Iframe simulation / Embed) */}
              <div className="w-full md:w-2/3 h-full flex flex-col p-4 sm:p-6 lg:p-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 30%, transparent)' }}>
                <div className="flex-1 overflow-hidden relative rounded-4xl shadow-2xl border border-white/5 bg-black/40">
                  <iframe
                    src="https://www.instagram.com/miguel_elfotografo/embed"
                    className="absolute inset-0 w-full h-full border-0"
                    title="Instagram Feed"
                  />
                </div>
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/3 p-10 flex flex-col justify-center gap-8">
                <div>
                  <h2 className="text-4xl font-bold font-Cinzel mb-2" style={{ color: 'var(--text-main)' }}>
                    Instagram
                  </h2>
                  <p className="text-lg opacity-80" style={{ color: 'var(--text-muted)' }}>
                    @miguel_elfotografo
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--text-main)' }}>
                    Explore my daily work, stories, and behind-the-scenes on Instagram.
                    Join our visual community!
                  </p>
                </div>

                <motion.a
                  href="https://www.instagram.com/miguel_elfotografo/?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-all font-bold text-base sm:text-xl shadow-lg"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--bg-card) 40%, transparent)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)'
                  }}
                >
                  <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'var(--accent)' }} />
                  <span>Follow on Instagram</span>
                </motion.a>              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
