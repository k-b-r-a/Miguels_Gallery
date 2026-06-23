import { useRef, useEffect, useState } from 'react';
import Header from './components/Header';
import BentoGrid from './components/BentoGrid';
import Footer from './components/Footer';
import AboutMe from './components/AboutMe';
import AboutMeTop from './components/AboutMeTop';
import Contact from './components/Contact';
import SocialNetworks from './components/SocialNetworks';
import CustomCursor from './components/CustomCursor';
import { ThemeProvider } from './utils/ThemeContext';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { API_BASE_URL } from './utils/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, PhotoIcon, VideoCameraIcon, UserCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface GlobalSettings {
  profileImgTop: string;
  profileImgTopId: string;
  profileImgBottom: string;
  profileImgBottomId: string;
  parallaxBgTop: string;
  parallaxBgTopId: string;
  parallaxTypeTop: 'image' | 'video';
  parallaxBgBottom: string;
  parallaxBgBottomId: string;
  parallaxTypeBottom: 'image' | 'video';
}

function AdminSettingsPanel({ settings, onUpdate }: { settings: GlobalSettings, onUpdate: (s: Partial<GlobalSettings>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Sincronización completada con éxito. Recarga la página para ver los cambios.');
        window.location.reload();
      } else {
        const data = await res.json();
        alert('Error al sincronizar: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      const error = err as Error;
      alert('Error de conexión: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof GlobalSettings) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(field);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/upload?field=${field}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const { url, cloudinaryId } = await res.json();
        const idField = `${field}Id` as keyof GlobalSettings;
        onUpdate({ 
          [field]: url,
          [idField]: cloudinaryId
        });
      }
    } catch (err) {
      const error = err as Error;
      alert('Error al subir archivo: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsUploading(null);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 transition-all active:scale-95"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 sm:p-8 my-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-Cinzel font-bold text-white">Ajustes de Diseño</h2>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Profile Image Top */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-3">Foto Perfil Superior (Inicio)</label>
            <div className="flex gap-4 items-center">
              <img src={settings.profileImgTop} className="w-14 h-16 rounded-xl object-cover border border-white/10" alt="" />
              <label className="grow p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                <UserCircleIcon className="w-5 h-5 text-white/40" />
                <span className="text-xs font-bold text-white">{isUploading === 'profileImgTop' ? 'Subiendo...' : 'Cambiar Foto'}</span>
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'profileImgTop')} disabled={!!isUploading} />
              </label>
            </div>
          </div>

          {/* Profile Image Bottom */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-3">Foto Perfil Inferior (Sobre mí)</label>
            <div className="flex gap-4 items-center">
              <img src={settings.profileImgBottom} className="w-14 h-16 rounded-xl object-cover border border-white/10" alt="" />
              <label className="grow p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                <UserCircleIcon className="w-5 h-5 text-white/40" />
                <span className="text-xs font-bold text-white">{isUploading === 'profileImgBottom' ? 'Subiendo...' : 'Cambiar Foto'}</span>
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'profileImgBottom')} disabled={!!isUploading} />
              </label>
            </div>
          </div>

          {/* Parallax Top (Hero/Gallery) */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-3">Fondo Superior (Inicio)</label>
            <div className="flex gap-2 mb-3">
               {(['image', 'video'] as const).map(type => (
                 <button 
                    key={type}
                    onClick={() => onUpdate({ parallaxTypeTop: type })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${settings.parallaxTypeTop === type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >{type === 'image' ? 'Imagen' : 'Video'}</button>
               ))}
            </div>
            <label className="p-3 w-full bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
              {settings.parallaxTypeTop === 'image' ? <PhotoIcon className="w-5 h-5 text-white/40" /> : <VideoCameraIcon className="w-5 h-5 text-white/40" />}
              <span className="text-xs font-bold text-white">{isUploading === 'parallaxBgTop' ? 'Subiendo...' : 'Subir Fondo'}</span>
              <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'parallaxBgTop')} disabled={!!isUploading} />
            </label>
            {settings.parallaxBgTop && (
              <button onClick={() => onUpdate({ parallaxBgTop: '' })} className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-2 hover:text-red-300">Eliminar fondo superior</button>
            )}
          </div>

          {/* Parallax Bottom (About/Contact) */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-3">Fondo Inferior (Info)</label>
            <div className="flex gap-2 mb-3">
               {(['image', 'video'] as const).map(type => (
                 <button 
                    key={type}
                    onClick={() => onUpdate({ parallaxTypeBottom: type })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${settings.parallaxTypeBottom === type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >{type === 'image' ? 'Imagen' : 'Video'}</button>
               ))}
            </div>
            <label className="p-3 w-full bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
              {settings.parallaxTypeBottom === 'image' ? <PhotoIcon className="w-5 h-5 text-white/40" /> : <VideoCameraIcon className="w-5 h-5 text-white/40" />}
              <span className="text-xs font-bold text-white">{isUploading === 'parallaxBgBottom' ? 'Subiendo...' : 'Subir Fondo'}</span>
              <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'parallaxBgBottom')} disabled={!!isUploading} />
            </label>
            {settings.parallaxBgBottom && (
              <button onClick={() => onUpdate({ parallaxBgBottom: '' })} className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-2 hover:text-red-300">Eliminar fondo inferior</button>
            )}
          </div>

          {/* Sync Assets from Cloudinary */}
          <div className="p-6 bg-purple-600/10 border border-purple-500/30 rounded-3xl mt-4">
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 text-purple-400">
                  <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Sincronización Manual</span>
               </div>
               <p className="text-[10px] text-white/40 leading-relaxed">
                  Si subiste archivos directamente al panel de Cloudinary (carpeta <code className="text-purple-300">Miguels_gallery/photos/</code>), usa este botón para importarlos a la galería.
               </p>
               <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isSyncing ? 'bg-purple-600/20 text-white/20 cursor-wait' : 'bg-purple-600 text-white hover:bg-purple-500 active:scale-95 shadow-lg'}`}
               >
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Galería'}
               </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full mt-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-colors shadow-xl"
        >Guardar Cambios</button>
      </motion.div>
    </div>
  );
}

function MainContent() {
  const aboutTopRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const { isAdmin, token } = useAuth();
  
  const [activeZone, setActiveZone] = useState<'top' | 'bottom'>('top');
  const [settings, setSettings] = useState<GlobalSettings>({
    profileImgTop: '/assets/Gemini_Generated_Image_mos68wmos68wmos6.png',
    profileImgTopId: '',
    profileImgBottom: '/assets/Gemini_Generated_Image_mos68wmos68wmos6.png',
    profileImgBottomId: '',
    parallaxBgTop: '',
    parallaxBgTopId: '',
    parallaxTypeTop: 'image',
    parallaxBgBottom: '',
    parallaxBgBottomId: '',
    parallaxTypeBottom: 'image'
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      });
  }, []);

  const updateSettings = async (newPartial: Partial<GlobalSettings>) => {
    const next = { ...settings, ...newPartial };
    setSettings(next);
    
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newPartial)
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          alert('Error al guardar ajustes: ' + (errorData.error || 'Error desconocido'));
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error saving settings:', error.message || error);
        alert('Error de conexión al guardar ajustes: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const galleryEntry = entries.find(e => e.target.id === 'gallery-section');
        const aboutEntry = entries.find(e => e.target.id === 'about-section');
        const homeEntry = entries.find(e => e.target.id === 'home-section');

        // Logic for Parallax Zone Toggle
        if (aboutEntry?.isIntersecting) {
          setActiveZone('bottom');
        } else if (homeEntry?.isIntersecting || galleryEntry?.isIntersecting) {
          setActiveZone('top');
        }
      },
      { threshold: [0, 0.1, 0.5, 0.9, 1.0] }
    );

    const sections = ['home-section', 'gallery-section', 'about-section', 'contact-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const headerOptions = [
    { 'title': 'Inicio', 'ref': aboutTopRef },
    { 'title': 'Galería', 'ref': galleryRef },
    { 'title': 'Sobre mí', 'ref': aboutRef },
    { 'title': 'Contacto', 'ref': contactRef }
  ]

  return (
    <div className="relative transition-colors duration-300" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Global Dynamic Parallax Background (Fixed & Non-Overlapping) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <AnimatePresence mode='wait'>
          {activeZone === 'top' ? (
            settings.parallaxBgTop && (
              <motion.div 
                key="top-parallax"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {settings.parallaxTypeTop === 'video' ? (
                  <video src={settings.parallaxBgTop} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={settings.parallaxBgTop} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20" />
              </motion.div>
            )
          ) : (
            settings.parallaxBgBottom && (
              <motion.div 
                key="bottom-parallax"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {settings.parallaxTypeBottom === 'video' ? (
                  <video src={settings.parallaxBgBottom} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={settings.parallaxBgBottom} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-transparent" />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <Header headerOptions={headerOptions} />

      <main className="relative z-10">
        {/* Semi-transparent sections */}
        <section id="home-section" className="snap-section bg-transparent">
          <AboutMeTop ref={aboutTopRef} profileImg={settings.profileImgTop} />
        </section>

        <section id="gallery-section" className="relative">
          <BentoGrid ref={galleryRef} />
        </section>

        <section id="about-section" className="snap-section min-h-screen flex flex-col justify-center bg-transparent">
          <AboutMe ref={aboutRef} profileImg={settings.profileImgBottom} />
        </section>

        <section id="contact-section" className="snap-section min-h-screen flex flex-col bg-transparent">

          <div className="grow flex flex-col justify-center">
            <Contact ref={contactRef} />
          </div>
          <Footer ref={footerRef} />
        </section>
      </main>

      <SocialNetworks />
      {isAdmin && <AdminSettingsPanel settings={settings} onUpdate={updateSettings} />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CustomCursor />
        <MainContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
