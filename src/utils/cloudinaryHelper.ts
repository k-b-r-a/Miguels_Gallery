/**
 * Utility to transform Cloudinary URLs for performance optimization.
 */
export function getOptimizedUrl(url: string, { width, height, quality = 'auto', format = 'auto' }: { width?: number, height?: number, quality?: string, format?: string } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Cloudinary transformation format: /upload/f_auto,q_auto,w_500/v123/id
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    'c_limit' // Ensures it doesn't upscale if original is smaller
  ].filter(Boolean).join(',');

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
