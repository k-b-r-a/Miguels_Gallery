import { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, ChatBubbleLeftRightIcon, PhoneIcon } from '@heroicons/react/24/outline';
import PhotoSnake from './PhotoSnake';

const Contact = forwardRef<HTMLDivElement>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);

  return (
    <div
      className="relative py-24 px-6 sm:px-10 lg:px-20 transition-colors duration-300 overflow-hidden backdrop-blur-[2px]"
      ref={(el) => {
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
        (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
      }}
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-app) 70%, transparent)' }}
    >
      {/* Parallax Decorative Background */}
      <motion.div style={{ y: y1 }} className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl font-bold font-Cinzel mb-4"
            style={{ color: 'var(--text-main)' }}
          >
            Hablemos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-60 max-w-2xl mx-auto"
            style={{ color: 'var(--text-main)' }}
          >
            ¿Tienes algún proyecto en mente o simplemente quieres saludar? Me encantaría saber de ti.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Info Side */}
          <div className="max-w-2xl w-full space-y-8 mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 sm:p-12 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 40%, transparent)' }}
            >
              <div className="grid grid-cols-1 gap-8">
                <a href="mailto:miguel.elfotografoo@gmail.com" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover/item:bg-purple-500 group-hover/item:text-white transition-all duration-300">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>Email Profesional</p>
                    <p className="text-lg sm:text-xl font-bold font-SpaceGrotesk group-hover/item:text-purple-500 transition-colors" style={{ color: 'var(--text-main)' }}>miguel.elfotografoo@gmail.com</p>
                  </div>
                </a>

                <a href="https://wa.me/573212270147" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 group-hover/item:bg-green-500 group-hover/item:text-white transition-all duration-300">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>WhatsApp Directo</p>
                    <p className="text-lg sm:text-xl font-bold font-SpaceGrotesk group-hover/item:text-green-500 transition-colors" style={{ color: 'var(--text-main)' }}>+57 321 227 0147</p>
                  </div>
                </a>

                <a href="https://instagram.com/miguel_elfotografo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500 group-hover/item:bg-pink-500 group-hover/item:text-white transition-all duration-300">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>Instagram</p>
                    <p className="text-lg sm:text-xl font-bold font-SpaceGrotesk group-hover/item:text-pink-500 transition-colors" style={{ color: 'var(--text-main)' }}>@miguel_elfotografo</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-4 opacity-40"
            >
              <MapPinIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Bogotá, Colombia</span>
            </motion.div>
          </div>

          {/* Snake Minigame Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end"
          >
            <PhotoSnake />
          </motion.div>

        </div>
      </div>
    </div>
  );
})

Contact.displayName = 'Contact';

export default Contact;
