/**
 * Utility functions for handling image URLs
 */

/**
 * Normalizes a profile picture URL to ensure it's a full URL
 * Handles both relative URLs (from old uploads) and full URLs
 * Converts HTTP to HTTPS when on an HTTPS page to prevent mixed content issues
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
  }

  // If it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If we're on HTTPS and the URL is HTTP, convert to HTTPS to prevent mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  }

  // If it's a relative URL (starts with /), prepend the API URL
  if (url.startsWith('/')) {
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

