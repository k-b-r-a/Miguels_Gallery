import { useApiData } from '../utils/APIGallery';
import { BentoCard } from './BentoCards';
import { forwardRef, useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import { getDailyPhrase } from '../utils/dailyPhrases';
import { PlusIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../utils/apiConfig';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { AnimatePresence, motion, useScroll, useTransform, LayoutGroup } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import VhsCylinderCarousel, { type PhotoItem } from './VhsCylinderCarousel';

export type { PhotoItem };

const BentoGrid = forwardRef<HTMLDivElement>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridStartRef = useRef<HTMLDivElement>(null);
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

  const featuredItems = items.filter(item => item.isFeatured);
  const carouselItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 6);

  useEffect(() => { if (apiData) setItems(apiData as PhotoItem[]); }, [apiData]);

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
      const oldIndex = items.findIndex((item: PhotoItem) => item._id === active.id);
      const newIndex = items.findIndex((item: PhotoItem) => item._id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      const orders = newItems.map((item: PhotoItem, index: number) => ({ id: item._id, position: index }));
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
          <VhsCylinderCarousel
            items={carouselItems}
            carouselIndex={carouselIndex}
            setCarouselIndex={setCarouselIndex}
            handleCarouselClick={handleCarouselClick}
            onToggleDelete={handleToggleDelete}
            onUpdate={handleItemUpdate}
            pendingDeletions={pendingDeletions}
            isAdmin={isAdmin}
          />
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
                    <BentoCard key={photo._id} id={photo._id} title={photo.title} description={photo.description} category={photo.category} img={photo.img} orientation={(photo.orientation as 'horizontal' | 'vertical')} resourceType={photo.resourceType} metadata={photo.metadata} peopleTags={photo.peopleTags} status={photo.status} isPendingDeletion={pendingDeletions.has(photo._id)} onToggleDelete={handleToggleDelete} onUpdate={handleItemUpdate} isFeatured={photo.isFeatured} gridSpan={photo.gridSpan} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </SortableContext>
          <DragOverlay adjustScale={false} dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeId ? (<div className="shadow-2xl">{(() => { const activeItem = items.find(item => item._id === activeId); if (!activeItem) return null; return (<BentoCard id={activeItem._id} title={activeItem.title} description={activeItem.description} category={activeItem.category} img={activeItem.img} orientation={(activeItem.orientation as 'horizontal' | 'vertical')} resourceType={activeItem.resourceType} peopleTags={activeItem.peopleTags} status={activeItem.status} isFeatured={activeItem.isFeatured} gridSpan={activeItem.gridSpan} onUpdate={handleItemUpdate} />); })()}</div>) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
})

BentoGrid.displayName = 'BentoGrid';
export default BentoGrid;
