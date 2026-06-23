import { useApiData } from '../utils/APIGallery';
import { BentoCard, PhotoDialog } from './BentoCards';
import { forwardRef, useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getDailyPhrase } from '../utils/dailyPhrases';
import { PlusIcon, TrashIcon, PencilSquareIcon, ArrowPathIcon, ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../utils/apiConfig';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToWindowEdges, restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { AnimatePresence, motion, useScroll, useTransform, LayoutGroup } from 'framer-motion';
import { CSS } from '@dnd-kit/utilities';
import imageCompression from 'browser-image-compression';

interface PhotoItem {
  _id: string;
  title: string;
  description: string;
  category?: string;
  img: string;
  orientation: string;
  resourceType?: 'image' | 'video';
  isFeatured?: boolean;
  status?: 'published' | 'pending';
  gridSpan?: { cols: number; rows: number; };
  peopleTags?: { name: string; href: string; }[];
  metadata?: {
    iso?: string;
    shutterSpeed?: string;
    aperture?: string;
    focalLength?: string;
    camera?: string;
    location?: string;
  };
}

const CarouselSortableItem = ({ item, index, isActive, isVisible, setCarouselIndex, handleCarouselClick, onToggleDelete, onUpdate, isPendingDeletion }: {
  item: PhotoItem;
  index: number;
  isActive: boolean;
  isVisible: boolean;
  setCarouselIndex: (idx: number) => void;
  handleCarouselClick: (cat: string | undefined) => void;
  onToggleDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Omit<PhotoItem, '_id'>>) => void;
  isPendingDeletion: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category || 'General');
  const [location, setLocation] = useState(item.metadata?.location || '');
  const [peopleTags, setPeopleTags] = useState(item.peopleTags || []);
  const [isFeatured, setIsFeatured] = useState(item.isFeatured || false);
  const { isAdmin, token } = useAuth();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : (isActive ? 20 : 10),
    opacity: isDragging ? 0.6 : (isVisible ? 1 : 0),
    pointerEvents: (isVisible || isDragging) ? 'auto' : 'none' as React.CSSProperties['pointerEvents']
  };

  const handleUpdate = async (featuredStatus?: boolean, _span?: unknown, updatedPeopleTags?: { name: string; href: string; }[], updatedStatus?: PhotoItem['status']) => {
    const finalFeatured = typeof featuredStatus === 'boolean' ? featuredStatus : isFeatured;
    const finalPeopleTags = updatedPeopleTags || peopleTags;
    const finalStatus = updatedStatus || item.status;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, category, isFeatured: finalFeatured, peopleTags: finalPeopleTags, status: finalStatus })
      });
      if (res.ok) {
        setIsEditMode(false);
        if (typeof featuredStatus === 'boolean') setIsFeatured(featuredStatus);
        if (updatedPeopleTags) setPeopleTags(updatedPeopleTags);

        onUpdate?.(item._id, {
          title, description, category, isFeatured: finalFeatured, peopleTags: finalPeopleTags, status: finalStatus
        });
      }
    } catch {
      alert('Error al actualizar');
    }
  };

  const toggleFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdate(!isFeatured);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 snap-center">
      <motion.div
        onClick={(e) => {
          setCarouselIndex(index);
          const nodeEl = e.currentTarget.parentElement as HTMLElement;
          const el = nodeEl?.parentElement as HTMLElement;
          if (el && nodeEl) {
             const targetScrollLeft = nodeEl.offsetLeft - (el.clientWidth / 2) + (nodeEl.clientWidth / 2);
             el.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
          }
        }}
        initial={false}
        animate={{
          scale: isActive ? 1 : 0.8,
          filter: isActive ? 'grayscale(0) brightness(1.1) blur(0px)' : 'grayscale(0.5) brightness(1) blur(1px)',
        }}
        transition={{ duration: 0.4 }}
        className={`relative w-[300px] sm:w-[600px] h-[200px] sm:h-[400px] rounded-md overflow-hidden shadow-2xl border-[10px] sm:border-[20px] border-zinc-900 bg-black vhs-scanlines cursor-pointer ${isActive ? 'shadow-[0_50px_100px_rgba(0,0,0,0.8)]' : ''}`}
      >
        <div className="vhs-noise" />
        {isActive && <div className="vhs-tracking" />}
        <div className="absolute top-0 left-0 w-full h-2 sm:h-4 flex justify-around items-center px-2 bg-zinc-900/90 z-20">
          {[...Array(12)].map((_, i) => (<div key={i} className="w-2 sm:w-4 h-1 sm:h-2 bg-black/90 rounded-xs" />))}
        </div>
        {item.resourceType === 'video' ? (
          <video
            src={item.img}
            className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${isActive ? 'scale-105 vhs-glitch' : 'scale-100'} ${isPendingDeletion || item.status === 'pending' ? 'grayscale opacity-50' : ''}`}
            autoPlay loop muted playsInline
            style={{ position: 'relative', zIndex: 5 }}
          />
        ) : (
          <img src={item.img} alt="" className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${isActive ? 'scale-105 vhs-glitch' : 'scale-100'} ${isPendingDeletion || item.status === 'pending' ? 'grayscale opacity-50' : ''}`} style={{ position: 'relative', zIndex: 5 }} />
        )}
        {isAdmin && isActive && (
          <div className="absolute top-8 right-8 flex gap-3 z-40">
            {item.status === 'pending' && (
              <button onClick={(e) => { e.stopPropagation(); handleUpdate(undefined, undefined, undefined, 'published'); }} className="p-3 bg-green-500 text-white rounded-full shadow-xl active:scale-90 flex items-center gap-2">
                <PlusIcon className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase pr-2">Publicar</span>
              </button>
            )}
            <button onClick={toggleFeatured} className={`p-3 rounded-full shadow-xl bg-white/90 ${isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </button>
            <button {...attributes} {...listeners} className="p-3 bg-white/90 rounded-full text-purple-600 hover:bg-white shadow-xl touch-none" onClick={(e) => e.stopPropagation()}><ArrowsPointingOutIcon className="w-6 h-6" /></button>
            {!isPendingDeletion && (<button onClick={(e) => { e.stopPropagation(); setIsOpen(true); setIsEditMode(true); }} className="p-3 bg-white/90 rounded-full text-blue-600 hover:bg-white shadow-xl"><PencilSquareIcon className="w-6 h-6" /></button>)}
            <button onClick={(e) => { e.stopPropagation(); onToggleDelete(item._id); }} className={`p-3 rounded-full shadow-xl ${isPendingDeletion ? 'bg-green-500 text-white' : 'bg-white/90 text-red-600'}`}>{isPendingDeletion ? <ArrowPathIcon className="w-6 h-6" /> : <TrashIcon className="w-6 h-6" />}</button>
          </div>
        )}
        {isPendingDeletion && (<div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-30 pointer-events-none"><span className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl">Eliminación pendiente</span></div>)}
        {item.status === 'pending' && !isPendingDeletion && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 pointer-events-none"><span className="bg-zinc-800 text-white/50 border border-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">Pendiente de Publicación</span></div>)}
        {isActive && !isPendingDeletion && item.status !== 'pending' && (
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-30 pointer-events-none font-mono text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2"><div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-600 rounded-full animate-pulse" /><span className="text-sm sm:text-xl font-bold tracking-tighter">REC</span></div>
              <div className="text-right"><span className="text-sm sm:text-xl font-bold block">PLAY</span><span className="text-[8px] sm:text-xs opacity-60">SP MODE</span></div>
            </div>
            <div className="flex justify-between items-end pointer-events-auto cursor-pointer group/osd" onClick={(e) => { e.stopPropagation(); handleCarouselClick(category); }}>
              <div className="flex flex-col"><span className="text-lg sm:text-4xl font-black italic uppercase tracking-tighter leading-none group-hover/osd:text-purple-400 transition-colors">{title}</span><span className="text-purple-400 font-bold uppercase tracking-widest text-[8px] sm:text-xs mt-1">{category}</span></div>
              <div className="text-right font-bold leading-tight"><span className="block tracking-widest text-[10px] sm:text-lg">Miguel Sedano</span><span className="opacity-50 text-[8px] sm:text-xs"></span></div>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full h-2 sm:h-4 flex justify-around items-center px-2 bg-zinc-900/90 z-20">
          {[...Array(12)].map((_, i) => (<div key={i} className="w-2 sm:w-4 h-1 sm:h-2 bg-black/90 rounded-xs" />))}
        </div>
        {!isActive && !isDragging && (<div className="absolute inset-0 flex items-center justify-center z-25"><div className="px-4 py-1 bg-white/5 border border-white/10 rounded rotate-[-2deg] backdrop-blur-sm"><span className="text-white/20 font-mono text-[8px] sm:text-xs uppercase tracking-[0.3em]">STRIP_0{(index % 9) + 1}</span></div></div>)}
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <PhotoDialog isOpen={isOpen} setIsOpen={setIsOpen} isEditing={isEditing} setIsEditMode={setIsEditMode} img={item.img} title={title} setTitle={setTitle} description={description} setDescription={setDescription} location={location} setLocation={setLocation} category={category} setCategory={setCategory} peopleTags={peopleTags} setPeopleTags={setPeopleTags} isFeatured={isFeatured} setIsFeatured={setIsFeatured} metadata={item.metadata} handleUpdate={handleUpdate} orientation="horizontal" resourceType={item.resourceType} />
        )}
      </AnimatePresence>
    </div>
  );
};

const BentoGrid = forwardRef<HTMLDivElement>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridStartRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const apiData = useApiData(`${API_BASE_URL}/api/photos`);
  const [items, setItems] = useState<PhotoItem[]>([]);
  const { isAdmin, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const dailyPhrase = useMemo(() => getDailyPhrase(), []);

  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const featuredItems = items.filter(item => item.isFeatured);
  const carouselItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 6);

  useEffect(() => { if (apiData) setItems(apiData as PhotoItem[]); }, [apiData]);

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const interval = setInterval(() => {
      if (!isCarouselPaused && !isAdmin) {
        scrollCarousel('right');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [carouselItems.length, isCarouselPaused, isAdmin]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      const itemNodes = Array.from(el.querySelectorAll('.snap-center'));
      let closestIndex = 0;
      let minDistance = Infinity;

      itemNodes.forEach((node, index) => {
        const nodeEl = node as HTMLElement;
        const nodeCenter = nodeEl.offsetLeft + nodeEl.clientWidth / 2;
        const distance = Math.abs(scrollCenter - nodeCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setCarouselIndex(prev => prev !== closestIndex ? closestIndex : prev);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [carouselItems.length]);

  const handleItemUpdate = (id: string, updates: Partial<Omit<PhotoItem, '_id'>>) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item));
  };

  const uniqueCategories = useMemo(() => {
    const cats = items
      .filter(item => isAdmin || item.status !== 'pending')
      .map(item => item.category || 'General')
      .filter((v, i, a) => a.indexOf(v) === i);
    return cats.sort();
  }, [items, isAdmin]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category || 'General'));
    }

    if (isAdmin) return result;

    result = result.filter(item => item.status !== 'pending');
    return featuredItems.length > 0 && selectedCategories.length === 0 ? result.filter(item => !item.isFeatured) : result;
  }, [items, selectedCategories, featuredItems.length, isAdmin]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      const el = carouselRef.current;
      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      const itemNodes = Array.from(el.querySelectorAll('.snap-center'));
      
      let closestIndex = 0;
      let minDistance = Infinity;

      itemNodes.forEach((node, index) => {
        const nodeEl = node as HTMLElement;
        const nodeCenter = nodeEl.offsetLeft + nodeEl.clientWidth / 2;
        const distance = Math.abs(scrollCenter - nodeCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      let nextIndex = dir === 'right' ? closestIndex + 1 : closestIndex - 1;
      
      if (nextIndex >= itemNodes.length) {
         nextIndex = 0;
      } else if (nextIndex < 0) {
         nextIndex = itemNodes.length - 1;
      }

      const targetNode = itemNodes[nextIndex] as HTMLElement;
      if (targetNode) {
        const targetScrollLeft = targetNode.offsetLeft - (el.clientWidth / 2) + (targetNode.clientWidth / 2);
        el.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const arrayFiles = Array.from(files);
      const processedFiles: File[] = [];
      setIsUploading(true);
      for (const file of arrayFiles) {
        if (file.type.startsWith('image/') && file.size > 10 * 1024 * 1024) {
          try {
            const compressed = await imageCompression(file, { maxSizeMB: 9.5, maxWidthOrHeight: 4096, useWebWorker: true, initialQuality: 0.9 });
            processedFiles.push(new File([compressed], file.name, { type: file.type }));
          } catch { processedFiles.push(file); }
        } else if (file.type.startsWith('video/') && file.size > 100 * 1024 * 1024) {
          alert(`Video "${file.name}" supera 100MB.`);
          setIsUploading(false); return;
        } else processedFiles.push(file);
      }
      if (processedFiles.length > 0 && token) {
        const formData = new FormData();
        processedFiles.forEach(f => formData.append('images', f));
        try {
          const res = await fetch(`${API_BASE_URL}/api/photos/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
          if (res.ok) window.location.reload();
        } catch { alert('Error al subir'); } finally { setIsUploading(false); }
      }
    }
  };

  const handleToggleDelete = (id: string) => {
    setPendingDeletions(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const handleSaveDeletions = async () => {
    if (pendingDeletions.size === 0) return;
    if (!window.confirm(`¿Eliminar ${pendingDeletions.size} fotos?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/batch-delete`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids: Array.from(pendingDeletions) }) });
      if (res.ok) { setItems(prev => prev.filter(item => !pendingDeletions.has(item._id))); setPendingDeletions(new Set()); }
    } catch { alert('Error de conexión'); } finally { setIsSaving(false); }
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      const orders = newItems.map((item, index) => ({ id: item._id, position: index }));
      try { await fetch(`${API_BASE_URL}/api/photos/reorder`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orders }) }); } catch { /* ignore */ }
    }
  }

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  const scrollToGallery = () => gridStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleCarouselClick = (category: string | undefined) => {
    if (category) {
      setSelectedCategories([category]);
      setTimeout(scrollToGallery, 100);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div ref={(el) => { if (typeof ref === 'function') ref(el); else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el; (containerRef as React.RefObject<HTMLDivElement | null>).current = el; }} className="relative py-24 sm:py-32 transition-colors duration-300 backdrop-blur-[1px]" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-app) 85%, transparent)' }}>
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden"><div className="absolute top-1/4 left-10 text-[20vw] font-black font-Cinzel rotate-12" style={{ color: 'var(--text-main)' }}>ART</div><div className="absolute bottom-1/4 right-10 text-[20vw] font-black font-Cinzel -rotate-12" style={{ color: 'var(--text-main)' }}>LIGHT</div></motion.div>
      <div className="z-10 relative flex flex-col items-center w-full mb-12">
        {carouselItems.length > 0 && (
          <div 
            className="relative w-full min-h-[350px] sm:min-h-[600px] flex items-center overflow-hidden bg-black/40 border-y border-white/5 mb-12"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            <div className="absolute top-1/2 left-4 z-30 -translate-y-1/2"><button onClick={() => scrollCarousel('left')} className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-purple-600 transition-all active:scale-90"><ChevronLeftIcon className="w-6 h-6" /></button></div>
            <div className="absolute top-1/2 right-4 z-30 -translate-y-1/2"><button onClick={() => scrollCarousel('right')} className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-purple-600 transition-all active:scale-90"><ChevronRightIcon className="w-6 h-6" /></button></div>
            <div className="absolute inset-x-0 h-px bg-white/10 top-1/4 z-0" /><div className="absolute inset-x-0 h-px bg-white/10 bottom-1/4 z-0" />
            <div ref={carouselRef} className="flex items-center gap-6 sm:gap-12 overflow-x-auto px-[10vw] no-scrollbar snap-x snap-mandatory py-20 scroll-smooth w-full">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={() => { }} modifiers={[restrictToHorizontalAxis]}>
                <SortableContext items={carouselItems.map(i => i._id)} strategy={horizontalListSortingStrategy} disabled={!isAdmin}>
                  {carouselItems.map((item, index) => (
                    <CarouselSortableItem key={item._id} item={item} index={index} isActive={index === carouselIndex} isVisible={true} setCarouselIndex={setCarouselIndex} handleCarouselClick={handleCarouselClick} onToggleDelete={handleToggleDelete} onUpdate={handleItemUpdate} isPendingDeletion={pendingDeletions.has(item._id)} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <div className="absolute bottom-4 w-full max-w-2xl px-10 flex flex-col gap-1 z-20 left-1/2 -translate-x-1/2"><div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" animate={{ width: `${((carouselIndex + 1) / carouselItems.length) * 100}%` }} /></div><div className="flex justify-between text-[8px] font-mono text-white/30 uppercase tracking-tighter"><span>0:00:00:00</span><span>LINEAR_TAPE_T0{(carouselIndex + 1).toString().padStart(2, '0')}</span><span>2:45:12:00</span></div></div>
          </div>
        )}

        <motion.div style={{ y: yText }} className="w-full py-10 sm:py-16 px-4 transition-all flex flex-col items-center">
          <p className="text-center text-lg sm:text-2xl lg:text-4xl font-bold tracking-tighter text-balance font-Cinzel leading-[1.1] max-w-5xl mb-10" style={{ color: 'var(--text-main)' }}>{dailyPhrase}</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl px-6">
            <button onClick={() => setSelectedCategories([])} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategories.length === 0 ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>Todos</button>
            {uniqueCategories.map(cat => (<button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategories.includes(cat) ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>{cat}</button>))}
          </div>
          <AnimatePresence>{selectedCategories.length > 0 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="mt-8 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-main)' }}>Filtrando por {selectedCategories.join(', ')}</span></motion.div>)}</AnimatePresence>
        </motion.div>
        {isAdmin && (<div className="mt-8 flex flex-wrap justify-center gap-4"><label className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-purple-700 transition-all shadow-xl active:scale-95">{isUploading ? 'Procesando...' : <><PlusIcon className="w-6 h-6" />Agregar Nueva Foto<input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} multiple /></>}</label>{pendingDeletions.size > 0 && (<motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleSaveDeletions} disabled={isSaving} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl active:scale-95 flex items-center gap-3">{isSaving ? 'Guardando...' : `Guardar cambios (${pendingDeletions.size})`}</motion.button>)}</div>)}
      </div>

      <div ref={gridStartRef} className="w-full px-4 sm:px-6 lg:px-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <SortableContext items={filteredItems.map(i => i._id)} strategy={rectSortingStrategy} disabled={!isAdmin || !!selectedCategories.length}>
            <LayoutGroup>
              <motion.div layout className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 sm:mt-16 lg:grid-cols-4 auto-rows-[120px] sm:auto-rows-[150px] grid-flow-dense">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((photo) => (
                    <BentoCard key={photo._id} id={photo._id} title={photo.title} description={photo.description} category={photo.category} img={photo.img} resourceType={photo.resourceType} metadata={photo.metadata} peopleTags={photo.peopleTags} status={photo.status} isPendingDeletion={pendingDeletions.has(photo._id)} onToggleDelete={handleToggleDelete} onUpdate={handleItemUpdate} isFeatured={photo.isFeatured} gridSpan={photo.gridSpan} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </SortableContext>
          <DragOverlay adjustScale={false} dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeId ? (<div className="shadow-2xl">{(() => { const activeItem = items.find(item => item._id === activeId); if (!activeItem) return null; return (<BentoCard id={activeItem._id} title={activeItem.title} description={activeItem.description} category={activeItem.category} img={activeItem.img} resourceType={activeItem.resourceType} peopleTags={activeItem.peopleTags} status={activeItem.status} isFeatured={activeItem.isFeatured} gridSpan={activeItem.gridSpan} onUpdate={handleItemUpdate} />); })()}</div>) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
})

BentoGrid.displayName = 'BentoGrid';
export default BentoGrid;
