import { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AboutMe = forwardRef<HTMLDivElement, { profileImg: string }>(({ profileImg }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  const biography = [
    'Soy Miguel Sedano, también conocido como miguel_elfotografo. Soy fotógrafo y creador visual apasionado por capturar la esencia de los momentos cotidianos. A través de mi lente busco mostrar la belleza en lo simple, las emociones reales y los instantes que muchas veces pasan desapercibidos.',
    'Mi trabajo nace de la curiosidad por lo que me rodea: las formas de la ciudad, los reflejos en la lluvia, los gestos espontáneos y los colores que solo aparecen por un instante. No busco solo tomar fotos, sino detener el tiempo en pequeños fragmentos que cuentan historias.',
    'En esta galería encontrarás parte de mi manera de ver el mundo: imperfecto, cambiante y lleno de detalles que merecen ser observados con calma, donde la luz, la textura y la emoción son los verdaderos protagonistas.'
  ];

  return (
    <div 
      className="relative py-20 px-6 sm:px-10 lg:px-20 transition-colors duration-300 overflow-hidden backdrop-blur-[2px]" 
      ref={(el) => {
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
        (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
      }} 
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-app) 70%, transparent)' }}
    >
      {/* Parallax Background Blobs */}
      <motion.div style={{ y: y1 }} className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center max-w-7xl mx-auto py-10 z-10">

        {/* Text Section */}
        <div className="lg:col-span-7 flex flex-col justify-center min-h-75">
          <div className="font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
            {biography.map((paragraph, pIdx) => (
              <motion.p
                key={pIdx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * pIdx, duration: 0.8 }}
                className="mb-8 last:mb-0 text-lg sm:text-xl lg:text-2xl leading-relaxed text-pretty"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="lg:col-span-5 relative group">
          <motion.div
            style={{ rotate, y: y2 }}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="relative aspect-4/5 lg:aspect-3/4 w-full rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 bg-black/10"
          >
            <img
              src={profileImg}
              alt="Miguel Sedano"
              className="w-full h-full object-cover grayscale-20 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-tr from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[4rem] pointer-events-none" />
          </motion.div>
          {/* Credit Link */}
          <div className="mt-4 text-center lg:text-right px-4">
            <a
              href="https://www.instagram.com/echelegafas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 font-SpaceGrotesk"
              style={{ color: 'var(--text-main)' }}
            >
              Foto por @echelegafas
            </a>
          </div>
          <div className="absolute -right-8 top-1/2 -rotate-90 origin-right pointer-events-none select-none hidden lg:block">
            <motion.span 
              style={{ x: y1, color: 'var(--text-main)' }}
              className="text-[120px] font-black font-Cinzel opacity-[0.03] leading-none whitespace-nowrap" 
            >
              PHOTOGRAPHY
            </motion.span>
          </div>
        </div>

      </div>
    </div>
  );
})

AboutMe.displayName = 'AboutMe';

export default AboutMe;
