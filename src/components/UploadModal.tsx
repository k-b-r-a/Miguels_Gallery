import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PhotoIcon, MapPinIcon, TagIcon, ChatBubbleBottomCenterTextIcon, StarIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../utils/apiConfig';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: UploadData) => void;
  files: File[];
  isUploading: boolean;
}

export interface UploadData {
  title: string;
  description: string;
  category: string;
  location: string;
  isFeatured: boolean;
  peopleTags?: { name: string; href: string; }[];
}

export default function UploadModal({ isOpen, onClose, onUpload, files, isUploading }: UploadModalProps) {
  const [data, setData] = useState<UploadData>({
    title: '',
    description: '',
    category: 'General',
    location: '',
    isFeatured: false,
    peopleTags: []
  });
  const [previews, setPreviews] = useState<{ url: string, type: string }[]>([]);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [newTagName, setNewTagName] = useState('');
  const [newTagHref, setNewTagHref] = useState('');

  const addTag = () => {
    if (newTagName && newTagHref) {
      setData(prev => ({
        ...prev,
        peopleTags: [...(prev.peopleTags || []), { name: newTagName, href: newTagHref }]
      }));
      setNewTagName('');
      setNewTagHref('');
    }
  };

  const removeTag = (index: number) => {
    setData(prev => ({
      ...prev,
      peopleTags: (prev.peopleTags || []).filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setBackendStatus('checking');
      fetch(`${API_BASE_URL}/api/ping`)
        .then(res => res.json())
        .then(() => setBackendStatus('online'))
        .catch(() => setBackendStatus('offline'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setPreviews(urls);
      
      if (files.length === 1) {
        setData(prev => ({ ...prev, title: files[0].name.split('.')[0] }));
      } else {
        setData(prev => ({ ...prev, title: `Lote de ${files.length} archivos` }));
      }

      return () => urls.forEach(p => URL.revokeObjectURL(p.url));
    } else {
      setPreviews([]);
    }
  }, [files]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel as={motion.div}
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className="bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] sm:max-h-[85vh]"
        >
          {/* Preview Section */}
          <div className="w-full md:w-1/2 bg-zinc-950 flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5 min-h-[250px] md:min-h-0">
            <div className="flex-1 relative overflow-hidden">
               {previews.length > 0 ? (
                 <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 overflow-y-auto custom-scrollbar content-start">
                   {previews.map((p, idx) => (
                     <div key={idx} className={`relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group/thumb ${previews.length === 1 ? 'col-span-2 sm:col-span-3 aspect-auto h-full' : ''}`}>
                        {p.type.startsWith('video') ? (
                          <video src={p.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                          <img src={p.url} className="w-full h-full object-cover" alt="" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-[10px] font-black text-white px-2 py-1 bg-black/60 rounded-lg">Fichero {idx + 1}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                   <PhotoIcon className="w-20 h-20 text-white/5" />
                 </div>
               )}
            </div>
            
            {files.length > 1 && (
              <div className="absolute bottom-4 left-4 z-10 bg-purple-600 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                <DocumentDuplicateIcon className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{files.length} Archivos</span>
              </div>
            )}
            <div className="absolute top-0 inset-x-0 h-12 bg-linear-to-b from-zinc-950/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-zinc-950/80 to-transparent pointer-events-none" />
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col bg-zinc-900 overflow-y-auto custom-scrollbar relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <DialogTitle className="text-3xl font-Cinzel font-bold text-white tracking-tight">
                  {files.length > 1 ? 'Publicar Lote' : 'Nueva Foto'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                    {backendStatus === 'online' ? 'Servidor En Línea' : 'Servidor Desconectado'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-10 p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Límites de carga</span>
               <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-purple-400">📸 FOTOS: 10MB</span>
                    <span className="text-[10px] font-bold text-blue-400">🎥 VIDEOS: 100MB</span>
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-black text-white">{files.length} ITEMS</span>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 grow">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                  <TagIcon className="w-3.5 h-3.5" /> {files.length > 1 ? 'Título del Lote' : 'Título'}
                </label>
                <input 
                  required
                  value={data.title}
                  onChange={e => setData({...data, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                  placeholder={files.length > 1 ? 'Nombre de la sesión...' : 'Título de la imagen...'}
                />
              </div>

              {/* Category & Location Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                    <TagIcon className="w-3.5 h-3.5" /> Categoría
                  </label>
                  <input 
                    value={data.category}
                    onChange={e => setData({...data, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                    <MapPinIcon className="w-3.5 h-3.5" /> Ubicación
                  </label>
                  <input 
                    value={data.location}
                    onChange={e => setData({...data, location: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                  <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" /> Descripción
                </label>
                <textarea 
                  value={data.description}
                  onChange={e => setData({...data, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500 focus:bg-white/10 outline-none transition-all h-28 resize-none custom-scrollbar"
                  placeholder="Se aplicará a todo el lote..."
                />
              </div>

              {/* People Tags */}
              <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Etiquetar Personas
                </label>
                <div className="flex flex-wrap gap-2">
                  {data.peopleTags?.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-400 group/tag">
                      <span>@{tag.name}</span>
                      <button type="button" onClick={() => removeTag(idx)} className="hover:text-white transition-colors">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                  <input 
                    value={newTagHref}
                    onChange={e => setNewTagHref(e.target.value)}
                    placeholder="Enlace (IG/Web)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>
                <button 
                  type="button"
                  onClick={addTag}
                  className="w-full py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Agregar Etiqueta
                </button>
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl cursor-pointer hover:bg-white/10 transition-all group active:scale-[0.98]">
                <div className={`p-3 rounded-2xl transition-all ${data.isFeatured ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-white/5 text-white/20'}`}>
                  <StarIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col grow">
                  <span className="text-sm font-black text-white uppercase tracking-wider">Destacar</span>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-tight">Incluir en el carrusel principal</span>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${data.isFeatured ? 'bg-purple-600' : 'bg-white/10'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full transition-transform ${data.isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={data.isFeatured} 
                  onChange={e => setData({...data, isFeatured: e.target.checked})} 
                />
              </label>

              <button 
                type="submit"
                disabled={isUploading || backendStatus !== 'online'}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                  backendStatus === 'online' ? 'bg-white text-black hover:bg-purple-600 hover:text-white' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                }`}
              >
                {backendStatus === 'offline' 
                  ? 'Error de conexión' 
                  : backendStatus === 'checking' 
                    ? 'Verificando...' 
                    : isUploading 
                      ? 'Procesando...' 
                      : files.length > 1 ? `Publicar ${files.length} archivos` : 'Publicar Fotografía'}
              </button>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
