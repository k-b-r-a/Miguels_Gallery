const getBackendHost = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If we are on mobile/local network IP, use that IP for backend too
    if (hostname) return `http://${hostname}:4000`;
  }
  return 'http://localhost:4000';
};

export const API_BASE_URL = getBackendHost();

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
