import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOptimizedUrl } from '../utils/cloudinaryHelper'
import { useAuth } from '../utils/AuthContext'
import { TrashIcon, PencilSquareIcon, InformationCircleIcon, MapPinIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowPathIcon, PlusIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { API_BASE_URL } from '../utils/apiConfig'

interface PersonTag {
  name: string;
  href: string;
}

interface PhotoMetadata {
  iso?: string;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
  camera?: string;
  location?: string;
  isFeatured?: boolean;
}

interface CardProps {
  id: string;
  title: string;
  description: string;
  category?: string;
  img: string;
  resourceType?: 'image' | 'video';
  metadata?: PhotoMetadata;
  peopleTags?: PersonTag[];
  isPendingDeletion?: boolean;
  onToggleDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Omit<CardProps, 'id' | 'img' | 'onToggleDelete' | 'onUpdate'>>) => void;
  isFeatured?: boolean;
  gridSpan?: { cols: number; rows: number };
  status?: 'published' | 'pending';
}

function VideoPlayer({ src, className }: { src: string, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPos = (x / rect.width);
      videoRef.current.currentTime = clickedPos * videoRef.current.duration;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
  };

  return (
    <div 
      className={`relative group/video overflow-hidden bg-black flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-contain pointer-events-none" 
        autoPlay 
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onError={() => console.error(`❌ Error al cargar video principal: ${src}`)}
      />
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={togglePlay} />
      <AnimatePresence>
        {!isPlaying && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="p-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"><PlayIcon className="w-12 h-12 text-white" /></div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div animate={{ y: showControls ? 0 : 20, opacity: showControls ? 1 : 0 }} transition={{ duration: 0.4 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-20 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-3">
           <div className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative group/progress overflow-hidden" onClick={handleProgressClick}>
              <div className="absolute inset-0 bg-white/5 group-hover/progress:bg-white/10" />
              <motion.div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] relative z-10" style={{ width: `${progress}%` }} />
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">{isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}</button>
                 <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">{isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}</button>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">HD PLAYBACK</span>
                 <button onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }} className="text-white hover:text-purple-400 transition-colors"><ArrowsPointingOutIcon className="w-5 h-5" /></button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export function BentoCard({ id, title: initialTitle, description: initialDescription, category: initialCategory, img, resourceType = 'image', metadata, peopleTags: initialPeopleTags, isPendingDeletion, onToggleDelete, onUpdate, isFeatured: initialIsFeatured, gridSpan: initialGridSpan, status: initialStatus }: CardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [location, setLocation] = useState(metadata?.location || '');
  const [category, setCategory] = useState(initialCategory || 'General');
  const [peopleTags, setPeopleTags] = useState<PersonTag[]>(initialPeopleTags || []);
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured || false);
  const [gridSpan, setGridSpan] = useState(initialGridSpan || { cols: 1, rows: 2 });
  const [status, setStatus] = useState<'published' | 'pending'>(initialStatus || 'published');
  const { isAdmin, token } = useAuth();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setLocation(metadata?.location || '');
    setCategory(initialCategory || 'General');
    setPeopleTags(initialPeopleTags || []);
    setIsFeatured(initialIsFeatured || false);
    setGridSpan(initialGridSpan || { cols: 1, rows: 2 });
    setStatus(initialStatus || 'published');
  }, [initialTitle, initialDescription, metadata?.location, initialCategory, initialPeopleTags, initialIsFeatured, initialGridSpan, initialStatus]);

  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 0, 
    opacity: isDragging ? 0.5 : 1, 
    '--cols': gridSpan.cols, 
    '--rows': gridSpan.rows,
    '--cols-mobile': Math.min(gridSpan.cols, 2),
    '--rows-mobile': Math.min(gridSpan.rows, 4)
  } as React.CSSProperties;

  const handleUpdate = async (featuredStatus?: boolean, newSpan?: { cols: number, rows: number }, updatedPeopleTags?: PersonTag[], updatedStatus?: 'published' | 'pending') => {
    const finalFeatured = typeof featuredStatus === 'boolean' ? featuredStatus : isFeatured;
    const finalSpan = newSpan || gridSpan;
    const finalPeopleTags = updatedPeopleTags || peopleTags;
    const finalStatus = updatedStatus || status;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ title, description, category, location, isFeatured: finalFeatured, gridSpan: finalSpan, peopleTags: finalPeopleTags, status: finalStatus }) 
      });
      if (res.ok) { 
        setIsEditMode(false); 
        if (typeof featuredStatus === 'boolean') setIsFeatured(featuredStatus); 
        if (newSpan) setGridSpan(newSpan);
        if (updatedPeopleTags) setPeopleTags(updatedPeopleTags);
        if (updatedStatus) setStatus(updatedStatus);
        
        if (typeof onUpdate === 'function') {
          onUpdate(id, {
            isFeatured: finalFeatured,
            gridSpan: finalSpan,
            peopleTags: finalPeopleTags,
            status: finalStatus,
            title,
            description,
            category,
            metadata: { ...metadata, location }
          });
        }
      }
    } catch (_err) { alert('Error al actualizar ' + _err); }
  };

  const toggleFeatured = (e: React.MouseEvent) => { e.stopPropagation(); handleUpdate(!isFeatured); };
  const handleResize = (dim: 'cols' | 'rows', delta: number) => {
    const next = { ...gridSpan };
    if (dim === 'cols') next.cols = Math.max(1, Math.min(4, next.cols + delta));
    else next.rows = Math.max(1, Math.min(6, next.rows + delta));
    setGridSpan(next);
    handleUpdate(isFeatured, next);
  };

  const thumbUrl = getOptimizedUrl(img, { width: 1000, quality: 'auto:eco' });

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isDragging ? { y: -5 } : {}}
      className="relative group/card min-h-[120px] bento-card-resizable h-full w-full cursor-pointer group z-0 hover:z-10"
    >
      <div className="absolute inset-px rounded-3xl shadow-sm group-hover:shadow-xl transition-all duration-500" style={{ backgroundColor: 'var(--bg-card)' }}></div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-3xl)-1px)]">
        <div className="relative overflow-hidden grow h-full">
          {resourceType === 'video' ? (
            <video 
              src={img} 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isPendingDeletion || status === 'pending' ? 'grayscale opacity-50' : ''}`} 
              autoPlay loop muted playsInline 
              onClick={() => !isPendingDeletion && setIsOpen(true)} 
              onError={() => console.error(`❌ Error al cargar miniatura de video: ${img}`)}
            />
          ) : (
            <motion.img 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isPendingDeletion || status === 'pending' ? 'grayscale opacity-50' : ''}`} 
              src={thumbUrl} 
              alt={title} 
              onClick={() => !isPendingDeletion && setIsOpen(true)} 
              onError={() => console.error(`❌ Error al cargar miniatura de imagen: ${thumbUrl}`)}
            />
          )}
          {isAdmin && (
            <>
              <button {...attributes} {...listeners} className="absolute top-2 left-2 sm:top-4 sm:left-4 p-1.5 sm:p-2 bg-white/90 rounded-full text-purple-600 hover:bg-white shadow-lg z-30 touch-none active:scale-110 transition-transform"><ArrowsPointingOutIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 opacity-100 z-20">
                {status === 'pending' && (
                  <button onClick={(e) => { e.stopPropagation(); handleUpdate(undefined, undefined, undefined, 'published'); }} className="p-1.5 sm:p-2 bg-green-500 text-white rounded-full shadow-lg active:scale-90 flex items-center gap-1">
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[9px] font-black uppercase px-1 hidden sm:inline">Publicar</span>
                  </button>
                )}
                <button onClick={toggleFeatured} className={`p-1.5 sm:p-2 rounded-full shadow-lg active:scale-90 bg-white/90 ${isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}><svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(true); setIsEditMode(true); }} className="p-1.5 sm:p-2 bg-white/90 rounded-full text-blue-600 hover:bg-white shadow-lg active:scale-90"><PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); onToggleDelete?.(id); }} className={`p-1.5 sm:p-2 rounded-full shadow-lg active:scale-90 ${isPendingDeletion ? 'bg-green-500 text-white' : 'bg-white/90 text-red-600'}`}>{isPendingDeletion ? <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover/card:border-purple-500/30 rounded-[calc(var(--radius-3xl)-1px)] pointer-events-none transition-colors" />
              <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
                 <div className="flex items-center bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-2xl">
                    <button onClick={(e) => { e.stopPropagation(); handleResize('cols', -1); }} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black transition-all active:scale-90" title="Reducir Ancho">-</button>
                    <span className="px-2 text-[10px] font-black text-white/40 select-none">H</span>
                    <button onClick={(e) => { e.stopPropagation(); handleResize('cols', 1); }} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black transition-all active:scale-90" title="Aumentar Ancho">+</button>
                 </div>
                 <div className="flex items-center bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-2xl">
                    <button onClick={(e) => { e.stopPropagation(); handleResize('rows', -1); }} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black transition-all active:scale-90" title="Reducir Alto">-</button>
                    <span className="px-2 text-[10px] font-black text-white/40 select-none">V</span>
                    <button onClick={(e) => { e.stopPropagation(); handleResize('rows', 1); }} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black transition-all active:scale-90" title="Aumentar Alto">+</button>
                 </div>
              </div>
            </>
          )}
          {isPendingDeletion && (<div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none"><span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">Eliminación pendiente</span></div>)}
          {status === 'pending' && !isPendingDeletion && (<div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"><span className="bg-zinc-800 text-white/70 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Por publicar</span></div>)}
          {metadata && !isPendingDeletion && (<div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"><div className="flex gap-4 text-[10px] text-white font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap">{metadata.iso && <span>ISO {metadata.iso}</span>}{metadata.shutterSpeed && <span>{metadata.shutterSpeed}s</span>}{metadata.aperture && <span>f/{metadata.aperture}</span>}{metadata.focalLength && <span>{metadata.focalLength}</span>}</div></div>)}
        </div>
        <AnimatePresence>
          {isOpen && (
            <PhotoDialog isOpen={isOpen} setIsOpen={setIsOpen} isEditing={isEditing} setIsEditMode={setIsEditMode} img={img} title={title} setTitle={setTitle} description={description} setDescription={setDescription} location={location} setLocation={setLocation} category={category} setCategory={setCategory} peopleTags={peopleTags} setPeopleTags={setPeopleTags} isFeatured={isFeatured} setIsFeatured={setIsFeatured} metadata={metadata} handleUpdate={handleUpdate} orientation={gridSpan.rows > gridSpan.cols ? 'vertical' : 'horizontal'} resourceType={resourceType} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export const BentoCardLg = BentoCard;

interface PhotoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isEditing: boolean;
  setIsEditMode: (editing: boolean) => void;
  img: string;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  peopleTags: PersonTag[];
  setPeopleTags: (tags: PersonTag[]) => void;
  isFeatured?: boolean;
  setIsFeatured?: (featured: boolean) => void;
  metadata?: PhotoMetadata;
  handleUpdate: (featuredStatus?: boolean, newSpan?: { cols: number, rows: number }, updatedPeopleTags?: PersonTag[], updatedStatus?: 'published' | 'pending') => void;
  orientation: 'horizontal' | 'vertical';
  resourceType?: 'image' | 'video';
}

export function PhotoDialog({ isOpen, setIsOpen, isEditing, setIsEditMode, img, title, setTitle, description, setDescription, location, setLocation, category, setCategory, peopleTags, setPeopleTags, isFeatured, setIsFeatured, metadata, handleUpdate, orientation, resourceType = 'image' }: PhotoDialogProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagHref, setNewTagHref] = useState('');
  const { isAdmin } = useAuth();
  const addTag = () => { if (newTagName && newTagHref) { setPeopleTags([...peopleTags, { name: newTagName, href: newTagHref }]); setNewTagName(''); setNewTagHref(''); } };
  const removeTag = (index: number) => { setPeopleTags(peopleTags.filter((_, i) => i !== index)); };

  return (
    <Dialog static open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-md" />
      <div className="fixed inset-0 flex items-center justify-center p-0 md:p-6">
        <DialogPanel as={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="max-w-7xl w-full h-full md:h-[90vh] rounded-0 md:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row" style={{ backgroundColor: 'var(--bg-app)' }}>
          <div className="flex flex-col md:flex-row w-full h-full overflow-hidden relative">
            <div className={`w-full md:w-2/3 lg:w-3/4 bg-black flex items-center justify-center relative overflow-hidden ${orientation === 'vertical' ? 'h-full' : 'h-[45vh] sm:h-[55vh] md:h-full'}`}>
              {resourceType === 'video' ? <VideoPlayer src={img} className="w-full h-full" /> : <img src={img} alt={title} className="w-full h-full object-contain cursor-pointer" onClick={() => setIsOpen(false)} onError={() => console.error(`❌ Error al cargar imagen completa: ${img}`)} />}
              {orientation === 'vertical' && (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-6 right-6 md:hidden z-20"><button onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(true); }} className="p-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"><InformationCircleIcon className="w-6 h-6 text-purple-400" /><span className="text-[10px] font-bold uppercase tracking-widest pr-1">Info</span></button></motion.div>)}
            </div>
            <AnimatePresence>{orientation === 'vertical' && isDetailsOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" />)}</AnimatePresence>
            <motion.div initial={false} animate={{ y: orientation === 'vertical' && typeof window !== 'undefined' && window.innerWidth < 768 ? (isDetailsOpen ? 0 : '100%') : 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className={`${orientation === 'vertical' ? 'fixed md:relative' : 'relative'} bottom-0 left-0 right-0 z-40 md:z-auto w-full md:w-1/3 lg:w-1/4 ${orientation === 'vertical' ? 'h-[75vh]' : 'grow'} md:h-full p-6 sm:p-8 lg:p-10 flex flex-col ${orientation === 'vertical' ? 'rounded-t-[2.5rem]' : ''} md:rounded-none border-t md:border-t-0 md:border-l shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:shadow-none ${orientation === 'vertical' && !isDetailsOpen ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}`} style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border)' }}>
              {orientation === 'vertical' && (<div className="w-12 h-1.5 bg-gray-500/30 rounded-full mx-auto mb-6 md:hidden cursor-pointer" onClick={() => setIsDetailsOpen(false)} />)}
              {isEditing ? (
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-xl bg-black/5 border outline-none font-bold" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} />
                  <div className="flex gap-2">
                    <input value={category} placeholder="Categoría" onChange={(e) => setCategory(e.target.value)} className="flex-1 p-3 rounded-xl bg-black/5 border outline-none font-bold" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} />
                    <input value={location} placeholder="Ubicación" onChange={(e) => setLocation(e.target.value)} className="flex-1 p-3 rounded-xl bg-black/5 border outline-none font-bold" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} />
                  </div>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-xl bg-black/5 border outline-none h-32" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} />
                  <div className="space-y-3 p-4 rounded-xl bg-black/5 border" style={{ borderColor: 'var(--border)' }}>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block" style={{ color: 'var(--text-main)' }}>Etiquetar Personas</label>
                    <div className="flex flex-wrap gap-2 mb-3">{peopleTags.map((tag, idx) => (<div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-400"><span>@{tag.name}</span><button onClick={() => removeTag(idx)} className="hover:text-red-500 transition-colors"><XMarkIcon className="w-3 h-3" /></button></div>))}</div>
                    <div className="grid grid-cols-2 gap-2"><input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Nombre" className="p-2 text-xs rounded-lg bg-black/10 border outline-none" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} /><input value={newTagHref} onChange={(e) => setNewTagHref(e.target.value)} placeholder="URL" className="p-2 text-xs rounded-lg bg-black/10 border outline-none" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }} /></div>
                    <button onClick={addTag} className="w-full py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">Agregar Persona</button>
                  </div>
                  {isAdmin && (<label className="flex items-center gap-3 p-3 rounded-xl bg-black/5 border cursor-pointer hover:bg-black/10 transition-colors" style={{ borderColor: 'var(--border)' }}><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured?.(e.target.checked)} className="w-5 h-5 accent-purple-600" /><span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Destacar en VHS</span></label>)}
                  <div className="flex gap-2"><button onClick={() => handleUpdate(undefined, undefined, peopleTags)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">Guardar</button><button onClick={() => setIsEditMode(false)} className="px-5 py-3 bg-gray-500 text-white rounded-xl font-bold">Cancelar</button></div>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="relative mb-6"><div className="flex flex-col gap-3 w-full pr-10 md:pr-0"><div className="flex items-center justify-between"><span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] bg-purple-500/20 text-purple-400 border border-purple-500/30 backdrop-blur-md shadow-sm">{category}</span>{isFeatured && (<div className="flex items-center gap-1.5 text-yellow-500 drop-shadow-sm"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg><span className="text-[9px] font-black uppercase tracking-tighter">Destacada</span></div>)}</div><DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold font-Cinzel leading-[1.1] tracking-tighter" style={{ color: 'var(--text-main)' }}>{title}</DialogTitle><div className="w-16 h-1 bg-linear-to-r from-purple-500/40 to-transparent rounded-full mt-1" /></div></div>
                  <div className="grow overflow-y-auto pr-2 custom-scrollbar">
                    <Description className="mb-6 leading-relaxed text-lg italic" style={{ color: 'var(--text-muted)' }}>&quot;{description}&quot;</Description>
                    {peopleTags.length > 0 && (<div className="flex flex-wrap gap-2 mb-8">{peopleTags.map((tag, idx) => (<a key={idx} href={tag.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-purple-600/20 hover:border-purple-500/30 transition-all group/tag" style={{ color: 'var(--text-main)' }} onClick={(e) => e.stopPropagation()}><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse group-hover/tag:scale-125 transition-transform" />@{tag.name}</a>))}</div>)}
                    {metadata && (<div className="space-y-4 p-4 rounded-2xl bg-black/5 border" style={{ borderColor: 'var(--border)' }}><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-main)' }}><InformationCircleIcon className="w-4 h-4" /> Detalles Técnicos</div><div className="grid grid-cols-2 gap-4 text-sm">{metadata.camera && <div><p className="opacity-50 text-[10px]">Cámara</p><p className="font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{metadata.camera}</p></div>}{metadata.focalLength && <div><p className="opacity-50 text-[10px]">Lente</p><p className="font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{metadata.focalLength}</p></div>}{metadata.iso && <div><p className="opacity-50 text-[10px]">ISO</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{metadata.iso}</p></div>}{metadata.shutterSpeed && <div><p className="opacity-50 text-[10px]">Velocidad</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{metadata.shutterSpeed}</p></div>}{metadata.aperture && <div><p className="opacity-50 text-[10px]">Apertura</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{metadata.aperture.startsWith('f/') ? metadata.aperture : `f/${metadata.aperture}`}</p></div>}</div>{metadata.location && (<div className="pt-2 flex items-center gap-2 text-sm italic border-t mt-2" style={{ color: 'var(--accent)', borderColor: 'var(--border)' }}><MapPinIcon className="w-4 h-4" /> {metadata.location}</div>)}</div>)}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 md:top-8 md:right-8 z-100 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all shadow-2xl border border-white/20 active:scale-90"><XMarkIcon className="w-7 h-7" /></button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
