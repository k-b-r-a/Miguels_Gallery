import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { XMarkIcon, LockClosedIcon, UserIcon, KeyIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../utils/apiConfig';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token);
        onClose();
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-70">
          {/* Backdrop with extreme blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xl"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md overflow-hidden rounded-[3rem] shadow-2xl relative border border-white/20"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              {/* Header Gradient */}
              <div className="h-32 w-full bg-linear-to-br from-purple-600 to-indigo-700 flex items-center justify-center relative">
                <div className="absolute top-6 right-6">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner"
                >
                  <LockClosedIcon className="w-10 h-10 text-white" />
                </motion.div>
              </div>

              <div className="p-8 sm:p-10">
                <div className="text-center mb-8">
                  <DialogTitle className="text-3xl font-bold font-Cinzel" style={{ color: 'var(--text-main)' }}>
                    Admin Access
                  </DialogTitle>
                  <p className="mt-1 text-sm font-medium opacity-50" style={{ color: 'var(--text-main)' }}>
                    Por favor, identifícate para gestionar tu galería
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500/50 group-focus-within:text-purple-500 transition-colors">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border border-transparent focus:ring-2 ring-purple-500/50"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        color: 'var(--text-main)',
                      }}
                      placeholder="Nombre de usuario"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500/50 group-focus-within:text-purple-500 transition-colors">
                      <KeyIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border border-transparent focus:ring-2 ring-purple-500/50"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        color: 'var(--text-main)',
                      }}
                      placeholder="Contraseña secreta"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl"
                    >
                      <p className="text-red-500 text-xs font-bold text-center">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </div>
                    ) : 'Entrar al Panel'}
                  </motion.button>
                </form>
              </div>

              {/* Footer Decoration */}
              <div className="h-2 w-full bg-linear-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
