/**
 * Prepends the media base URL to a path.
 * In development: returns path as-is (empty VITE_MEDIA_URL)
 * In production: prepends S3/CDN URL
 */
export function getMediaUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_MEDIA_URL || '';

  // If no base URL, return path as-is
  if (!baseUrl) {
    return path;
  }

  // Ensure no double slashes when joining
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
