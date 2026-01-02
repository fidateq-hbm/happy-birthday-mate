/**
 * Utility functions for handling image URLs
 */

/**
 * Normalizes a profile picture URL to ensure it's a full URL
 * Handles both relative URLs (from old uploads) and full URLs
 * Routes uploads through the frontend proxy to avoid mixed content issues
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
  }

  // If it's already a full URL (from backend)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Extract the upload path from the URL
    // e.g., "https://backend.com/uploads/profile_pictures/123.jpg" -> "/uploads/profile_pictures/123.jpg"
    // or "http://localhost:8000/uploads/profile_pictures/123.jpg" -> "/uploads/profile_pictures/123.jpg"
    const uploadsMatch = url.match(/\/uploads\/(.+)$/);
    if (uploadsMatch) {
      // Route through frontend proxy to avoid mixed content
      return `/api/uploads/${uploadsMatch[1]}`;
    }
    
    // If we're on HTTPS and the URL is HTTP, convert to HTTPS to prevent mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      // Try to extract upload path even from HTTP URLs
      const httpUploadsMatch = url.match(/\/uploads\/(.+)$/);
      if (httpUploadsMatch) {
        return `/api/uploads/${httpUploadsMatch[1]}`;
      }
      return url.replace('http://', 'https://');
    }
    return url;
  }

  // If it's a relative URL (starts with /uploads/), route through frontend proxy
  if (url.startsWith('/uploads/')) {
    // Remove leading /uploads/ and route through API proxy
    const path = url.replace('/uploads/', '');
    return `/api/uploads/${path}`;
  }

  // If it's a relative URL (starts with /), check if it's an upload
  if (url.startsWith('/')) {
    // For non-upload paths, use API URL (for backward compatibility)
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // If we're on HTTPS and API URL is HTTP, convert to HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && apiUrl.startsWith('http://')) {
      apiUrl = apiUrl.replace('http://', 'https://');
    }
    
    return `${apiUrl}${url}`;
  }

  // Fallback: return as is (might be a data URL or other format)
  return url;
}

/**
 * Gets a fallback avatar URL based on a name
 */
export function getFallbackAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
}

