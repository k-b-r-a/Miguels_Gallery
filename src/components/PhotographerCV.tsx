import { motion } from 'framer-motion';
import {
  CameraIcon,
  SparklesIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  LightBulbIcon,
  FilmIcon
} from '@heroicons/react/24/outline';

interface Specialty {
  title: string;
  description: string;
  tags: string[];
}

interface TechnicalSkill {
  name: string;
  category: string;
  level: string;
}

interface GearCategory {
  title: string;
  items: string[];
  description: string;
}

interface ExperienceProject {
  year: string;
  role: string;
  projectOrClient: string;
  description: string;
  deliverables: string[];
}

const specialties: Specialty[] = [
  {
    title: 'Retrato Editorial',
    description: 'Sesiones conceptuales con iluminación calculada, dirección de expresión y estética editorial para revistas, books profesionales y artistas.',
    tags: ['Dirección de pose', 'Luz de estudio', 'Moodboard conceptual']
  },
  {
    title: 'Fotografía Urbana & Documental',
    description: 'Narrativa visual espontánea en calles y espacios públicos. Captura del dinamismo humano, arquitectura y contrastes de luz natural.',
    tags: ['Momento decisivo', 'Luz ambiente', 'Storytelling urbano']
  },
  {
    title: 'Cobertura de Eventos',
    description: 'Documentación en tiempo real para festivales culturales, lanzamientos de marca, conciertos y encuentros corporativos de alto impacto.',
    tags: ['Acción en vivo', 'Bajo ruido', 'Entrega ágil']
  },
  {
    title: 'Fotografía de Producto',
    description: 'Bodegón comercial y tomas de detalle orientadas a e-commerce, catálogos premium y posicionamiento visual de producto.',
    tags: ['Microiluminación', 'Fidelidad de color', 'Styling visual']
  },
  {
    title: 'Visual Storytelling',
    description: 'Construcción de historias visuales cohesivas de principio a fin, combinando foto fija y microformatos de video para marcas contemporáneas.',
    tags: ['Narrativa de marca', 'Criterio estético', 'Guion visual']
  }
];

const technicalSkills: TechnicalSkill[] = [
  { name: 'Iluminación natural y de estudio', category: 'Producción', level: 'Avanzado' },
  { name: 'Revelado RAW y gestión de color', category: 'Postproducción', level: 'Avanzado' },
  { name: 'Gradación de color (Color Grading)', category: 'Postproducción', level: 'Avanzado' },
  { name: 'Dirección de pose y expresión', category: 'Dirección', level: 'Avanzado' },
  { name: 'Adobe Lightroom Classic', category: 'Software', level: 'Experto' },
  { name: 'Adobe Photoshop', category: 'Software', level: 'Avanzado' },
  { name: 'Edición y corrección de video', category: 'Multimedia', level: 'Intermedio / Avanzado' }
];

const gearList: GearCategory[] = [
  {
    title: 'Cuerpo de Cámara',
    items: ['Cuerpo Full Frame Mirrorless de alta resolución', 'Sensor BSI con rango dinámico expandido', 'Grabación 4K Log / 10-bit'],
    description: 'Capacidad de respuesta inmediata y fidelidad cromática excepcional en cualquier condición lumínica.'
  },
  {
    title: 'Lentes Principales (Focales Fijas & Zoom)',
    items: [
      '35mm f/1.4 (Reportaje, contexto urbano y documental)',
      '50mm f/1.8 (Perspectiva natural y versatilidad)',
      '85mm f/1.4 (Retrato editorial y bokeh suave)',
      '24-70mm f/2.8 (Zoom estándar para eventos y cobertura dinámica)'
    ],
    description: 'Cristales de alta nitidez para máxima separación de planos y nitidez en bordes.'
  },
  {
    title: 'Iluminación Portátil & Modificadores',
    items: [
      'Flashes Speedlight TTL / HSS de alta velocidad',
      'Softbox parabólico portátil y octabox de montaje rápido',
      'Reflectores plegables 5 en 1 y difusores translúcidos',
      'Luces continuas LED bicolor para acentos y video'
    ],
    description: 'Kit adaptable y liviano para rodajes tanto en locación exterior como en estudio.'
  }
];

const experienceList: ExperienceProject[] = [
  {
    year: '2024 - Presente',
    role: 'Director Visual & Fotógrafo Principal',
    projectOrClient: 'Sesiones Editoriales Independientes & Artistas Urbanos',
    description: 'Dirección de arte, fotografía editorial y revelado cromático para lanzamientos musicales y diseñadores emergentes en Bogotá.',
    deliverables: ['Series editoriales', 'Lookbooks digitales', 'Contenido para plataformas de streaming']
  },
  {
    year: '2023 - 2024',
    role: 'Fotógrafo Documental & Cobertura Cultural',
    projectOrClient: 'Festivales de Arte, Muestras y Eventos en Vivo',
    description: 'Registro visual completo de encuentros escénicos y galerías de arte, capturando la interacción del público y la atmósfera del evento.',
    deliverables: ['Fotogalerías de alta resolución', 'Resúmenes gráficos en prensa', 'Selección destacada para archivo']
  },
  {
    year: '2022 - 2023',
    role: 'Fotógrafo de Producto & Creador de Contenido',
    projectOrClient: 'Marcas de Moda, Gastronomía y Retail Local',
    description: 'Desarrollo de campañas de producto, fotografía de catálogo para e-commerce y visual storytelling para posicionamiento digital.',
    deliverables: ['Catálogos de producto e-commerce', 'Fotografía de bodegón publicitario', 'Mini-clips de video vertical']
  },
  {
    year: '2021 - 2022',
    role: 'Fotógrafo Urbano & Documentalista',
    projectOrClient: 'Proyecto de Ensayo Visual Callejero (Bogotá)',
    description: 'Exploración de la geometría urbana, contrastes de luz y sombra, y retratos espontáneos en los barrios emblemáticos de la capital.',
    deliverables: ['Serie documental personal', 'Exhibición fotográfica digital', 'Publicaciones en formato fanzine']
  }
];

export default function PhotographerCV() {
  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-20 pt-16 border-t border-white/10 w-full">
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Curriculum Vitae & Propuesta Profesional</span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-bold font-Cinzel tracking-tight mb-4"
          style={{ color: 'var(--text-main)' }}
        >
          Servicios, Enfoque & Trayectoria
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg leading-relaxed opacity-75 font-SpaceGrotesk"
          style={{ color: 'var(--text-muted)' }}
        >
          Combinando precisión técnica, sensibilidad por la luz natural y un flujo de trabajo profesional desde la conceptualización hasta la entrega final de cada fotograma.
        </motion.p>
      </div>

      {/* 1. Especialidades & Servicios */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CameraIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
              Especialidades & Servicios
            </h4>
            <p className="text-xs uppercase tracking-widest opacity-50 font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
              Enfoques fotográficos adaptados a cada requerimiento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="p-6 rounded-3xl border border-white/5 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 55%, transparent)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">
                    0{index + 1}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-purple-500/40" />
                </div>
                <h5 className="text-lg font-bold font-Cinzel mb-2" style={{ color: 'var(--text-main)' }}>
                  {item.title}
                </h5>
                <p className="text-sm font-SpaceGrotesk leading-relaxed opacity-70 mb-5" style={{ color: 'var(--text-muted)' }}>
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-purple-300/80 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. Habilidades Técnicas & Flujo de Trabajo */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <SwatchIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
              Habilidades Técnicas & Flujo de Trabajo
            </h4>
            <p className="text-xs uppercase tracking-widest opacity-50 font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
              Dominio de producción lumínica, retoque y posproducción
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicalSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col justify-between transition-colors hover:border-purple-500/30"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 45%, transparent)' }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {skill.category}
                </span>
                <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              </div>
              <div>
                <p className="font-bold text-sm font-SpaceGrotesk mb-1" style={{ color: 'var(--text-main)' }}>
                  {skill.name}
                </p>
                <p className="text-[11px] opacity-50 font-mono" style={{ color: 'var(--text-muted)' }}>
                  Nivel: {skill.level}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Equipo & Ópticas (Gear) */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <WrenchScrewdriverIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
              Equipo & Ópticas (Gear)
            </h4>
            <p className="text-xs uppercase tracking-widest opacity-50 font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
              Herramientas de grado profesional para capturas de alta definición
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gearList.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-3xl border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 50%, transparent)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {index === 0 && <CameraIcon className="w-5 h-5 text-purple-400" />}
                  {index === 1 && <FilmIcon className="w-5 h-5 text-purple-400" />}
                  {index === 2 && <LightBulbIcon className="w-5 h-5 text-purple-400" />}
                  <h5 className="font-bold font-Cinzel text-base" style={{ color: 'var(--text-main)' }}>
                    {category.title}
                  </h5>
                </div>
                <p className="text-xs font-SpaceGrotesk opacity-60 mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {category.description}
                </p>
                <ul className="space-y-2.5 mb-4">
                  {category.items.map((gear) => (
                    <li key={gear} className="flex items-start gap-2.5 text-xs font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{gear}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Experiencia & Proyectos Destacados */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
              Experiencia & Proyectos Destacados
            </h4>
            <p className="text-xs uppercase tracking-widest opacity-50 font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
              Línea de tiempo de proyectos editoriales, comerciales y documentales
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {experienceList.map((exp, index) => (
            <motion.div
              key={exp.role + exp.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-purple-500/30"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 45%, transparent)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {exp.year}
                  </span>
                  <h5 className="text-lg sm:text-xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
                    {exp.role}
                  </h5>
                </div>
                <span className="text-xs font-semibold font-SpaceGrotesk opacity-60" style={{ color: 'var(--accent)' }}>
                  {exp.projectOrClient}
                </span>
              </div>

              <p className="text-sm font-SpaceGrotesk leading-relaxed opacity-75 mb-4" style={{ color: 'var(--text-muted)' }}>
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                {exp.deliverables.map((del) => (
                  <span
                    key={del}
                    className="text-[11px] font-medium font-SpaceGrotesk px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-purple-200/70"
                  >
                    • {del}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. Action Buttons (Download CV + CTA to Contact) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="p-8 sm:p-12 rounded-[3rem] border border-white/10 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 60%, transparent)' }}
      >
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h4 className="text-2xl sm:text-4xl font-bold font-Cinzel mb-3" style={{ color: 'var(--text-main)' }}>
            ¿Trabajamos Juntos?
          </h4>
          <p className="text-sm sm:text-base font-SpaceGrotesk opacity-75 mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Descarga el documento formal de mi currículum profesional o ponte en contacto directo para reservar una sesión fotográfica o cotizar una producción.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/cv-miguel-sedano.pdf"
              download="CV-Miguel-Sedano-Fotografo.pdf"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 group"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-purple-400 group-hover:translate-y-0.5 transition-transform" />
              <span>Descargar CV (PDF)</span>
            </a>

            <button
              type="button"
              onClick={handleScrollToContact}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm tracking-wide transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Iniciar Proyecto / Contacto</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
