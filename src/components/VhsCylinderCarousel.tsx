import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { PhotoDialog } from './BentoCards';
import { useAuth } from '../utils/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';

export interface PhotoItem {
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

interface VhsCylinderCarouselProps {
  items: PhotoItem[];
  carouselIndex: number;
  setCarouselIndex: (idx: number) => void;
  handleCarouselClick: (category: string | undefined) => void;
  onToggleDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Omit<PhotoItem, '_id'>>) => void;
  pendingDeletions: Set<string>;
  isAdmin: boolean;
}

export default function VhsCylinderCarousel({
  items,
  carouselIndex,
  setCarouselIndex,
  handleCarouselClick,
  onToggleDelete,
  onUpdate,
  pendingDeletions,
  isAdmin
}: VhsCylinderCarouselProps) {
  const { token } = useAuth();
  const [editingItem, setEditingItem] = useState<PhotoItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; rotation: number }>({ x: 0, rotation: 0 });
  const hasDraggedRef = useRef(false);

  // Responsive 3D dimensions
  const [dimensions, setDimensions] = useState({
    cardWidth: 540,
    cardHeight: 340,
    radius: 480,
    perspective: 1300
  });

  // Calculate cylinder slots (repeat if < 5 to form a rich circular cylinder)
  const cylinderSlots = useCallback(() => {
    if (items.length === 0) return [];
    if (items.length >= 5) {
      return items.map((item, idx) => ({ item, originalIndex: idx }));
    }
    const multiplier = items.length <= 2 ? 3 : 2;
    const slots: { item: PhotoItem; originalIndex: number }[] = [];
    for (let m = 0; m < multiplier; m++) {
      items.forEach((item, idx) => {
        slots.push({ item, originalIndex: idx });
      });
    }
    return slots;
  }, [items])();

  const totalSlots = cylinderSlots.length;
  const angleStep = totalSlots > 0 ? 360 / totalSlots : 0;

  // Responsive measurement
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const count = Math.max(totalSlots, 6);

      if (width < 480) {
        const cardWidth = Math.min(width - 48, 280);
        const cardHeight = Math.round(cardWidth * 0.62);
        const radius = Math.max(220, Math.round((cardWidth / 2) / Math.tan(Math.PI / count)));
        setDimensions({ cardWidth, cardHeight, radius, perspective: 850 });
      } else if (width < 768) {
        const cardWidth = 360;
        const cardHeight = 225;
        const radius = Math.max(300, Math.round((cardWidth / 2) / Math.tan(Math.PI / count)));
        setDimensions({ cardWidth, cardHeight, radius, perspective: 1000 });
      } else if (width < 1024) {
        const cardWidth = 460;
        const cardHeight = 285;
        const radius = Math.max(400, Math.round((cardWidth / 2) / Math.tan(Math.PI / count)));
        setDimensions({ cardWidth, cardHeight, radius, perspective: 1150 });
      } else {
        const cardWidth = 540;
        const cardHeight = 340;
        const radius = Math.max(480, Math.round((cardWidth / 2) / Math.tan(Math.PI / count)));
        setDimensions({ cardWidth, cardHeight, radius, perspective: 1300 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalSlots]);

  // Keep cylinder synchronized when carouselIndex is updated from outside
  useEffect(() => {
    if (totalSlots === 0 || isDragging) return;
    const currentNearestSlot = ((Math.round(-rotation / angleStep) % totalSlots) + totalSlots) % totalSlots;
    const currentOriginal = cylinderSlots[currentNearestSlot]?.originalIndex;
    if (currentOriginal !== carouselIndex) {
      // Find the closest slot matching carouselIndex
      let bestSlot = currentNearestSlot;
      let minDiff = Infinity;
      cylinderSlots.forEach((slot, slotIdx) => {
        if (slot.originalIndex === carouselIndex) {
          const diff = Math.abs(slotIdx - currentNearestSlot);
          if (diff < minDiff) {
            minDiff = diff;
            bestSlot = slotIdx;
          }
        }
      });
      const targetAngle = -bestSlot * angleStep;
      let diffAngle = ((targetAngle - rotation) % 360 + 540) % 360 - 180;
      setRotation(prev => prev + diffAngle);
    }
  }, [carouselIndex, totalSlots, angleStep, cylinderSlots, isDragging, rotation]);

  const rotateToSlot = useCallback((targetSlot: number) => {
    if (totalSlots === 0) return;
    const targetAngle = -targetSlot * angleStep;
    let diff = ((targetAngle - rotation) % 360 + 540) % 360 - 180;
    const nextRotation = rotation + diff;
    setRotation(nextRotation);

    const slot = cylinderSlots[targetSlot];
    if (slot) {
      setCarouselIndex(slot.originalIndex);
    }
  }, [angleStep, cylinderSlots, rotation, setCarouselIndex, totalSlots]);

  const handleNext = useCallback(() => {
    if (totalSlots === 0) return;
    const nextRotation = Math.round(rotation / angleStep) * angleStep - angleStep;
    setRotation(nextRotation);
    const nearestSlot = ((Math.round(-nextRotation / angleStep) % totalSlots) + totalSlots) % totalSlots;
    const slot = cylinderSlots[nearestSlot];
    if (slot) {
      setCarouselIndex(slot.originalIndex);
    }
  }, [angleStep, cylinderSlots, rotation, setCarouselIndex, totalSlots]);

  const handlePrev = useCallback(() => {
    if (totalSlots === 0) return;
    const prevRotation = Math.round(rotation / angleStep) * angleStep + angleStep;
    setRotation(prevRotation);
    const nearestSlot = ((Math.round(-prevRotation / angleStep) % totalSlots) + totalSlots) % totalSlots;
    const slot = cylinderSlots[nearestSlot];
    if (slot) {
      setCarouselIndex(slot.originalIndex);
    }
  }, [angleStep, cylinderSlots, rotation, setCarouselIndex, totalSlots]);

  // Auto rotation
  useEffect(() => {
    if (items.length <= 1 || isPaused || isDragging || isAdmin) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3200);
    return () => clearInterval(timer);
  }, [items.length, isPaused, isDragging, isAdmin, handleNext]);

  // Pointer drag to spin cylinder
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      rotation
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }
    const sensitivity = 0.32;
    setRotation(dragStartRef.current.rotation + deltaX * sensitivity);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }

    if (totalSlots > 0) {
      const nearestSlot = ((Math.round(-rotation / angleStep) % totalSlots) + totalSlots) % totalSlots;
      rotateToSlot(nearestSlot);
    }
  };

  // Admin Actions
  const toggleFeatured = async (item: PhotoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFeatured = !item.isFeatured;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isFeatured: newFeatured })
      });
      if (res.ok) {
        onUpdate?.(item._id, { isFeatured: newFeatured });
      }
    } catch {
      alert('Error al actualizar');
    }
  };

  const handlePublish = async (item: PhotoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'published' })
      });
      if (res.ok) {
        onUpdate?.(item._id, { status: 'published' });
      }
    } catch {
      alert('Error al publicar');
    }
  };

  const handleDialogUpdate = async (
    featuredStatus?: boolean,
    _span?: unknown,
    updatedPeopleTags?: { name: string; href: string; }[],
    updatedStatus?: PhotoItem['status']
  ) => {
    if (!editingItem) return;
    const finalFeatured = typeof featuredStatus === 'boolean' ? featuredStatus : editingItem.isFeatured;
    const finalPeopleTags = updatedPeopleTags || editingItem.peopleTags;
    const finalStatus = updatedStatus || editingItem.status;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${editingItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          isFeatured: finalFeatured,
          peopleTags: finalPeopleTags,
          status: finalStatus
        })
      });
      if (res.ok) {
        onUpdate?.(editingItem._id, {
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          isFeatured: finalFeatured,
          peopleTags: finalPeopleTags,
          status: finalStatus
        });
        setEditingItem(null);
      }
    } catch {
      alert('Error al actualizar');
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-black/40 border-y border-white/5 mb-12 select-none py-10 sm:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tape Alignment Horizontal Guides */}
      <div className="absolute inset-x-0 h-px bg-white/10 top-1/4 z-0 pointer-events-none" />
      <div className="absolute inset-x-0 h-px bg-white/10 bottom-1/4 z-0 pointer-events-none" />

      {/* Navigation Controls */}
      <div className="absolute top-1/2 left-3 sm:left-6 z-40 -translate-y-1/2">
        <button
          onClick={handlePrev}
          aria-label="Anterior cassette"
          className="p-3 sm:p-4 rounded-full bg-black/70 border border-white/15 text-white hover:bg-purple-600 hover:border-purple-400 transition-all active:scale-90 shadow-2xl backdrop-blur-md cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="absolute top-1/2 right-3 sm:right-6 z-40 -translate-y-1/2">
        <button
          onClick={handleNext}
          aria-label="Siguiente cassette"
          className="p-3 sm:p-4 rounded-full bg-black/70 border border-white/15 text-white hover:bg-purple-600 hover:border-purple-400 transition-all active:scale-90 shadow-2xl backdrop-blur-md cursor-pointer"
        >
          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 3D Cylindrical Stage */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{
          perspective: `${dimensions.perspective}px`,
          perspectiveOrigin: '50% 50%',
          height: `${dimensions.cardHeight + 100}px`
        }}
      >
        {/* Subtle Ground Radial Glow */}
        <div
          className="absolute w-[70%] max-w-[700px] h-20 bg-purple-500/15 rounded-[100%] blur-3xl pointer-events-none"
          style={{
            transform: `translateY(${dimensions.cardHeight / 2 + 30}px)`
          }}
        />

        {/* Cylinder Rotor Hub */}
        <div
          className="relative"
          style={{
            width: `${dimensions.cardWidth}px`,
            height: `${dimensions.cardHeight}px`,
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${dimensions.radius}px) rotateY(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {cylinderSlots.map((slot, slotIdx) => {
            const slotAngle = slotIdx * angleStep;
            let relAngle = ((slotAngle + rotation) % 360 + 540) % 360 - 180;
            const absAngle = Math.abs(relAngle);
            const isCardActive = absAngle < (angleStep / 2) || (totalSlots === 1);
            const isPending = pendingDeletions.has(slot.item._id);

            // Opacity & depth shading: front is full, sides clear, back dim
            const opacity = isCardActive ? 1 : absAngle < 90 ? 0.8 : 0.45;
            const filter = isCardActive
              ? 'none'
              : absAngle < 90
              ? 'brightness(0.9)'
              : 'brightness(0.55) blur(0.7px)';

            return (
              <div
                key={`${slot.item._id}-slot-${slotIdx}`}
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${slotAngle}deg) translateZ(${dimensions.radius}px)`,
                  opacity,
                  filter,
                  zIndex: isCardActive ? 35 : Math.round(100 - absAngle),
                  pointerEvents: isCardActive ? 'auto' : absAngle < 85 ? 'auto' : 'none'
                }}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  if (!isCardActive) {
                    rotateToSlot(slotIdx);
                  }
                }}
              >
                {/* Dual-Faced VHS Cassette Frame */}
                <div
                  className={`relative w-full h-full rounded-xl sm:rounded-2xl transition-transform duration-300 ${
                    isCardActive ? 'scale-100' : 'scale-[0.92]'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Face: VHS Photo / Video Display */}
                  <div
                    className={`absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-[6px] sm:border-[12px] border-zinc-900 bg-black vhs-scanlines ${
                      isCardActive
                        ? 'shadow-[0_20px_60px_rgba(168,85,247,0.35)]'
                        : 'shadow-black/80'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="vhs-noise" />
                    {isCardActive && <div className="vhs-tracking" />}

                    {/* Top Sprocket Perforations */}
                    <div className="absolute top-0 left-0 w-full h-2 sm:h-3.5 flex justify-around items-center px-2 bg-zinc-900/90 z-20 pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-2 sm:w-3.5 h-1 sm:h-1.5 bg-black/90 rounded-xs" />
                      ))}
                    </div>

                    {/* Media Render */}
                    {slot.item.resourceType === 'video' ? (
                      <video
                        src={slot.item.img}
                        className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${
                          isCardActive ? 'scale-105 vhs-glitch' : 'scale-100'
                        } ${isPending || slot.item.status === 'pending' ? 'grayscale opacity-50' : ''}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ position: 'relative', zIndex: 5 }}
                      />
                    ) : (
                      <img
                        src={slot.item.img}
                        alt={slot.item.title}
                        className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${
                          isCardActive ? 'scale-105 vhs-glitch' : 'scale-100'
                        } ${isPending || slot.item.status === 'pending' ? 'grayscale opacity-50' : ''}`}
                        style={{ position: 'relative', zIndex: 5 }}
                      />
                    )}

                    {/* Admin Overlay Controls */}
                    {isAdmin && isCardActive && (
                      <div className="absolute top-5 right-5 flex gap-2 z-40">
                        {slot.item.status === 'pending' && (
                          <button
                            onClick={(e) => handlePublish(slot.item, e)}
                            className="p-2 sm:p-2.5 bg-green-500 text-white rounded-full shadow-xl active:scale-90 flex items-center gap-1.5 hover:bg-green-600 transition-colors cursor-pointer"
                            title="Publicar foto"
                          >
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase pr-1">Publicar</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => toggleFeatured(slot.item, e)}
                          className={`p-2 sm:p-2.5 rounded-full shadow-xl bg-white/90 hover:bg-white transition-colors cursor-pointer ${
                            slot.item.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                          title="Destacar en VHS"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                        {!isPending && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(slot.item);
                            }}
                            className="p-2 sm:p-2.5 bg-white/90 rounded-full text-blue-600 hover:bg-white shadow-xl transition-colors cursor-pointer"
                            title="Editar información"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDelete(slot.item._id);
                          }}
                          className={`p-2 sm:p-2.5 rounded-full shadow-xl transition-colors cursor-pointer ${
                            isPending ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/90 text-red-600 hover:bg-white'
                          }`}
                          title={isPending ? 'Restaurar' : 'Eliminar'}
                        >
                          {isPending ? <ArrowPathIcon className="w-5 h-5" /> : <TrashIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    )}

                    {/* Pending Delete Badge */}
                    {isPending && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-30 pointer-events-none">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-2xl">
                          Eliminación pendiente
                        </span>
                      </div>
                    )}

                    {/* Pending Publish Badge */}
                    {slot.item.status === 'pending' && !isPending && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 pointer-events-none">
                        <span className="bg-zinc-800 text-white/70 border border-white/10 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-2xl">
                          Pendiente de Publicación
                        </span>
                      </div>
                    )}

                    {/* Front Active OSD (On Screen Display) */}
                    {isCardActive && !isPending && slot.item.status !== 'pending' && (
                      <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-between z-30 pointer-events-none font-mono text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-xs sm:text-lg font-bold tracking-tighter">REC</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs sm:text-lg font-bold block">PLAY</span>
                            <span className="text-[7px] sm:text-[10px] opacity-60">SP MODE</span>
                          </div>
                        </div>
                        <div
                          className="flex justify-between items-end pointer-events-auto cursor-pointer group/osd"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCarouselClick(slot.item.category);
                          }}
                        >
                          <div className="flex flex-col max-w-[70%]">
                            <span className="text-sm sm:text-xl lg:text-3xl font-black italic uppercase tracking-tighter leading-tight group-hover/osd:text-purple-400 transition-colors truncate">
                              {slot.item.title}
                            </span>
                            <span className="text-purple-400 font-bold uppercase tracking-widest text-[8px] sm:text-xs mt-0.5 sm:mt-1">
                              {slot.item.category || 'General'}
                            </span>
                          </div>
                          <div className="text-right font-bold leading-tight">
                            <span className="block tracking-widest text-[9px] sm:text-sm">Miguel Sedano</span>
                            <span className="opacity-50 text-[7px] sm:text-[10px]">TAPE_0{(slotIdx % 9) + 1}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Non-Active Cassette Title Badge */}
                    {!isCardActive && (
                      <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                        <div className="px-3 py-1 bg-white/10 border border-white/20 rounded rotate-[-2deg] backdrop-blur-sm shadow-md">
                          <span className="text-white/60 font-mono text-[8px] sm:text-xs uppercase tracking-[0.25em]">
                            STRIP_0{(slotIdx % 9) + 1}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Sprocket Perforations */}
                    <div className="absolute bottom-0 left-0 w-full h-2 sm:h-3.5 flex justify-around items-center px-2 bg-zinc-900/90 z-20 pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-2 sm:w-3.5 h-1 sm:h-1.5 bg-black/90 rounded-xs" />
                      ))}
                    </div>
                  </div>

                  {/* Back Face: Authentic VHS Cassette Shell */}
                  <div
                    className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-[6px] sm:border-[12px] border-zinc-950 bg-zinc-900 p-3 sm:p-5 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="flex justify-between items-center text-[7px] sm:text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1.5">
                      <span className="font-bold tracking-widest text-zinc-300">VHS HI-FI STEREO</span>
                      <span className="uppercase tracking-wider">SIDE B</span>
                      <span className="text-purple-400 font-bold">120 MIN</span>
                    </div>

                    {/* Cassette Tape Spools */}
                    <div className="flex justify-center items-center gap-4 sm:gap-8 py-2">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-zinc-700 bg-zinc-950 flex items-center justify-center relative shadow-inner">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-zinc-800 border border-zinc-600" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-0.5 bg-zinc-800 rotate-45" />
                          <div className="w-full h-0.5 bg-zinc-800 -rotate-45" />
                        </div>
                      </div>

                      <div className="h-5 w-12 sm:w-20 bg-black/80 rounded border border-zinc-700 flex items-center justify-center px-1.5 shadow-inner">
                        <div className="h-1 w-full bg-amber-900/50 rounded-full" />
                      </div>

                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-zinc-700 bg-zinc-950 flex items-center justify-center relative shadow-inner">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-zinc-800 border border-zinc-600" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-0.5 bg-zinc-800 rotate-45" />
                          <div className="w-full h-0.5 bg-zinc-800 -rotate-45" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-1.5 flex justify-between items-center text-[7px] sm:text-[9px] font-mono text-zinc-500">
                      <span className="tracking-widest">ARCHIVE REEL // 0{(slotIdx % 9) + 1}</span>
                      <span className="italic opacity-60 truncate max-w-[130px]">{slot.item.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Linear Tape HUD */}
      <div className="w-full max-w-2xl px-6 sm:px-10 mx-auto mt-6 flex flex-col gap-2 z-20">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
            animate={{ width: `${((carouselIndex + 1) / items.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-mono text-white/40 uppercase tracking-tighter">
          <span>0:00:00:00</span>
          <span className="text-purple-400 font-bold tracking-widest">
            CYLINDER_TAPE_T0{(carouselIndex + 1).toString().padStart(2, '0')}
          </span>
          <span>2:45:12:00</span>
        </div>

        {/* Interactive Reel Dots */}
        <div className="flex justify-center items-center gap-2 mt-2">
          {items.map((it, idx) => (
            <button
              key={`reel-dot-${it._id}`}
              onClick={() => setCarouselIndex(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                idx === carouselIndex
                  ? 'w-6 h-1.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Ir a foto ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Edit Modal (PhotoDialog) */}
      <AnimatePresence>
        {editingItem && (
          <PhotoDialog
            isOpen={!!editingItem}
            setIsOpen={(open) => {
              if (!open) setEditingItem(null);
            }}
            isEditing={true}
            setIsEditMode={(_edit) => { }}
            img={editingItem.img}
            title={editingItem.title}
            setTitle={(t) => setEditingItem(prev => prev ? { ...prev, title: t } : null)}
            description={editingItem.description}
            setDescription={(d) => setEditingItem(prev => prev ? { ...prev, description: d } : null)}
            location={editingItem.metadata?.location || ''}
            setLocation={(loc) => setEditingItem(prev => prev ? { ...prev, metadata: { ...prev.metadata, location: loc } } : null)}
            category={editingItem.category || 'General'}
            setCategory={(c) => setEditingItem(prev => prev ? { ...prev, category: c } : null)}
            peopleTags={editingItem.peopleTags || []}
            setPeopleTags={(tags) => setEditingItem(prev => prev ? { ...prev, peopleTags: tags } : null)}
            isFeatured={editingItem.isFeatured || false}
            setIsFeatured={(f) => setEditingItem(prev => prev ? { ...prev, isFeatured: f } : null)}
            metadata={editingItem.metadata}
            handleUpdate={handleDialogUpdate}
            orientation='horizontal'
            resourceType={editingItem.resourceType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
