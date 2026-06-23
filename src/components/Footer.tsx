import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Footer = forwardRef<HTMLDivElement>((_props, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="m-4 min-[375px]:pl-4 md:pl-0 mt-16 w-full mx-auto container lg:max-w-4xl md:max-w-2xl mb-10 flex justify-center rounded-2xl shadow-sm transition-colors duration-300"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)' }}
      ref={ref}
    >
      <div className="rounded-lg w-full max-w-7xl mx-auto md:flex md:items-center md:justify-between py-6 px-6">
        <span className="text-sm sm:text-center" style={{ color: 'var(--text-main)' }}>
          © {currentYear}
          <motion.a
            whileHover={{ color: 'var(--accent)' }}
            href="https://github.com/k-b-r-a"
            className="hover:underline font-bold transition-colors"
          >
            {' '}
            k-b-r-a
          </motion.a>
          . Todos los derechos reservados.
        </span>

        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium sm:mt-0 gap-4">
          <motion.li whileHover={{ x: 2 }}>
            <a
              href="/#sobre-mi"
              className="transition-colors"
              style={{ color: 'var(--text-main)' }}
            >
              Sobre mí
            </a>
          </motion.li>
          <motion.li whileHover={{ x: 2 }}>
            <a
              id="contacto"
              href="mailto:miguel-386@gmail.com"
              className="transition-colors"
              style={{ color: 'var(--text-main)' }}
            >
              Contacto
            </a>
          </motion.li>
        </ul>
      </div>
    </motion.footer>
  );
})

Footer.displayName = 'Footer';

export default Footer;
