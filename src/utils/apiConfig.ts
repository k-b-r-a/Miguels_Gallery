const getBackendHost = () => {
  // 1. Variable de entorno (inyectada por el bundler o GitHub Actions)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // 2. Si estamos en GitHub Pages o producción web
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) {
      return 'https://miguels-gallery.onrender.com';
    }
    // Si estamos en red local / IP móvil
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:4000`;
    }
  }

  // 3. Fallback a desarrollo local o producción
  return 'https://miguels-gallery.onrender.com';
};

export const API_BASE_URL = getBackendHost();

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
