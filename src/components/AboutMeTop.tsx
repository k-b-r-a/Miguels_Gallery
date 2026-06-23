import { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AboutMeTop = forwardRef<HTMLDivElement, { profileImg: string }>(({ profileImg }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });


  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div 
      ref={(el) => {
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
        (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
      }} 
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-6 backdrop-blur-[2px]"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}
    >
      {/* Background Decorative Text with Parallax */}
      <motion.div
        style={{ y: textY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="text-[25vw] font-black opacity-[0.03] leading-none text-zinc-500 whitespace-nowrap uppercase">
          Welcome
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl text-center">
        <motion.div
          style={{ y: imgY }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8 rounded-full overflow-hidden border-2 border-purple-500/20 shadow-2xl"
        >

          <img
            src={profileImg}
            alt="Miguel"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter font-Cinzel mb-4" style={{ color: 'var(--text-main)' }}>
            MIGUEL
          </h1>
          <p className="text-lg sm:text-xl font-bold uppercase tracking-[0.4em] opacity-60 max-w-2xl mx-auto" style={{ color: 'var(--text-main)' }}>
            Fotógrafo & Visual Storyteller
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 animate-bounce"
        >
          <div className="w-px h-16 bg-linear-to-b from-purple-500 to-transparent mx-auto" />
        </motion.div>
      </div>
    </div>
  );
})

AboutMeTop.displayName = 'AboutMeTop';

export default AboutMeTop;
