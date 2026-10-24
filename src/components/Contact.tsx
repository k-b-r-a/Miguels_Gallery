import { forwardRef, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PhotoSnake from './PhotoSnake';
import { API_BASE_URL } from '../utils/apiConfig';

export type ProjectType =
  | 'Sesión de Retrato'
  | 'Evento'
  | 'Producto / Marca'
  | 'Colaboración'
  | 'Otro';

interface InquiryFormState {
  name: string;
  email: string;
  projectType: ProjectType;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const projectTypes: ProjectType[] = [
  'Sesión de Retrato',
  'Evento',
  'Producto / Marca',
  'Colaboración',
  'Otro'
];

const initialFormState: InquiryFormState = {
  name: '',
  email: '',
  projectType: 'Sesión de Retrato',
  message: ''
};

const Contact = forwardRef<HTMLDivElement>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);

  const [form, setForm] = useState<InquiryFormState>(initialFormState);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setStatus('error');
      return;
    }

    if (!validateEmail(form.email.trim())) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setStatus('success');
        setForm(initialFormState);
      } else {
        const errorData = (await res.json()) as { error?: string };
        setErrorMessage(errorData.error || 'No se pudo enviar la consulta en este momento.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor. Puedes contactarme directamente por WhatsApp o Email.');
      setStatus('error');
    }
  };

  const getWhatsAppFallbackUrl = () => {
    const text = `Hola Miguel! Soy ${form.name || 'un cliente'}. Me interesa cotizar una ${form.projectType}: ${form.message || 'quisiera más información.'}`;
    return `https://wa.me/573212270147?text=${encodeURIComponent(text)}`;
  };

  const getMailtoFallbackUrl = () => {
    const subject = `Consulta de Proyecto: ${form.projectType} - ${form.name || 'Cliente'}`;
    const body = `Nombre: ${form.name}\nEmail: ${form.email}\nTipo de Proyecto: ${form.projectType}\n\nDetalles del proyecto:\n${form.message}`;
    return `mailto:miguel.elfotografoo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
            className="text-lg opacity-60 max-w-2xl mx-auto font-SpaceGrotesk"
            style={{ color: 'var(--text-main)' }}
          >
            ¿Tienes algún proyecto fotográfico en mente, necesitas cotizar una sesión o simplemente quieres saludar? Déjame un mensaje y coordinemos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Project Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 p-8 sm:p-12 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 45%, transparent)' }}
          >
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400 block mb-2">
                Formulario de Consulta & Reserva
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
                Cotiza Tu Proyecto
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold font-Cinzel text-white">¡Mensaje Enviado con Éxito!</h4>
                  <p className="text-sm font-SpaceGrotesk text-white/80 max-w-md mx-auto leading-relaxed">
                    Gracias por ponerte en contacto. Revisaré los detalles de tu proyecto y te responderé a la brevedad posible vía correo o teléfono.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Enviar otra consulta
                  </button>
                </motion.div>
              ) : (
                <form key="inquiry-form" onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                        <span>{errorMessage || 'Ocurrió un inconveniente al enviar la consulta.'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-red-500/20">
                        <span className="text-xs text-white/60 self-center">Puedes enviarlo directo:</span>
                        <a
                          href={getWhatsAppFallbackUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <PhoneIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={getMailtoFallbackUrl()}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <EnvelopeIcon className="w-3.5 h-3.5" />
                          <span>Email Directo</span>
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block" style={{ color: 'var(--text-main)' }}>
                      Nombre Completo <span className="text-purple-400">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Tu nombre o el de tu marca"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={status === 'submitting'}
                      className="w-full px-5 py-3.5 rounded-2xl border text-sm font-SpaceGrotesk outline-none transition-all focus:border-purple-500"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  {/* Email & Project Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block" style={{ color: 'var(--text-main)' }}>
                        Correo Electrónico <span className="text-purple-400">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="tu@correo.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={status === 'submitting'}
                        className="w-full px-5 py-3.5 rounded-2xl border text-sm font-SpaceGrotesk outline-none transition-all focus:border-purple-500"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-main)'
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block" style={{ color: 'var(--text-main)' }}>
                        Tipo de Proyecto
                      </label>
                      <select
                        value={form.projectType}
                        onChange={(e) => setForm({ ...form, projectType: e.target.value as ProjectType })}
                        disabled={status === 'submitting'}
                        className="w-full px-5 py-3.5 rounded-2xl border text-sm font-SpaceGrotesk outline-none transition-all focus:border-purple-500"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-main)'
                        }}
                      >
                        {projectTypes.map((type) => (
                          <option key={type} value={type} className="bg-zinc-900 text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block" style={{ color: 'var(--text-main)' }}>
                      Detalles del Proyecto & Fecha Tentativa <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Cuéntame sobre la idea, locación, número de personas, requerimientos de entrega o fecha estimada..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      disabled={status === 'submitting'}
                      className="w-full px-5 py-3.5 rounded-2xl border text-sm font-SpaceGrotesk outline-none transition-all focus:border-purple-500 resize-none"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {status === 'submitting' ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Enviando mensaje...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>Enviar Mensaje de Consulta</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Direct Contact Info & Minigame */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 sm:p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 40%, transparent)' }}
            >
              <div className="grid grid-cols-1 gap-6">
                <a href="mailto:miguel.elfotografoo@gmail.com" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover/item:bg-purple-500 group-hover/item:text-white transition-all duration-300">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>Email Profesional</p>
                    <p className="text-base sm:text-lg font-bold font-SpaceGrotesk group-hover/item:text-purple-500 transition-colors truncate max-w-[220px] sm:max-w-none" style={{ color: 'var(--text-main)' }}>miguel.elfotografoo@gmail.com</p>
                  </div>
                </a>

                <a href="https://wa.me/573212270147" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 group-hover/item:bg-green-500 group-hover/item:text-white transition-all duration-300">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>WhatsApp Directo</p>
                    <p className="text-base sm:text-lg font-bold font-SpaceGrotesk group-hover/item:text-green-500 transition-colors" style={{ color: 'var(--text-main)' }}>+57 321 227 0147</p>
                  </div>
                </a>

                <a href="https://instagram.com/miguel_elfotografo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item">
                  <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500 group-hover/item:bg-pink-500 group-hover/item:text-white transition-all duration-300">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>Instagram</p>
                    <p className="text-base sm:text-lg font-bold font-SpaceGrotesk group-hover/item:text-pink-500 transition-colors" style={{ color: 'var(--text-main)' }}>@miguel_elfotografo</p>
                  </div>
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 opacity-50">
                <MapPinIcon className="w-5 h-5 text-purple-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest font-SpaceGrotesk" style={{ color: 'var(--text-main)' }}>
                  Bogotá, Colombia
                </span>
              </div>
            </motion.div>

            {/* Snake Minigame Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 25%, transparent)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3" style={{ color: 'var(--text-main)' }}>
                Descanso interactivo
              </p>
              <PhotoSnake />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
});

Contact.displayName = 'Contact';

export default Contact;
