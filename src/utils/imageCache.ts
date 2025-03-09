// src/utils/imageCache.ts

// This is a global, singleton cache used across all components
// It tracks which images are placeholders to prevent unnecessary requests

interface ImageCacheType {
    // Map to track image load status (true = loaded successfully, false = failed/placeholder)
    loadStatus: Map<string, boolean>;
    
    // Methods to check and update image status
    isPlaceholder: (url: string) => boolean;
    markAsPlaceholder: (url: string) => void;
    markAsLoaded: (url: string) => void;
    
    // Pattern matching for known placeholder URLs
    matchesPlaceholderPattern: (url: string) => boolean;
    
    // Clear cache (useful for development)
    clearCache: () => void;
  }
  
  // Create singleton image cache instance
  const ImageCache: ImageCacheType = {
    loadStatus: new Map<string, boolean>(),
    
    isPlaceholder(url: string): boolean {
      // If we've already seen this URL and know it's a placeholder
      if (this.loadStatus.has(url)) {
        return this.loadStatus.get(url) === false;
      }
      
      // Check if it matches known placeholder patterns
      if (this.matchesPlaceholderPattern(url)) {
        this.markAsPlaceholder(url);
        return true;
      }
      
      return false;
    },
    
    markAsPlaceholder(url: string): void {
      this.loadStatus.set(url, false);
    },
    
    markAsLoaded(url: string): void {
      this.loadStatus.set(url, true);
    },
    
    matchesPlaceholderPattern(url: string): boolean {
      // Check for known placeholder patterns
      return (
        url.endsWith('bottle.png') || 
        url.includes('/no-image.') ||
        url.includes('/placeholder.') ||
        url.endsWith('/0-1.jpg') // Some sites use this pattern for missing images
      );
    },
    
    clearCache(): void {
      this.loadStatus.clear();
    }
  };
  
  // Store identified placeholder domains to optimize future checks
  if (typeof window !== 'undefined') {
    // Attempt to load from sessionStorage if available
    try {
      const savedPlaceholders = sessionStorage.getItem('placeholder-urls');
      if (savedPlaceholders) {
        const urls = JSON.parse(savedPlaceholders);
        urls.forEach((url: string) => {
          ImageCache.markAsPlaceholder(url);
        });
      }
    } catch (e) {
      console.log('Error loading placeholder cache from session storage', e);
    }
    
    // Save placeholders to sessionStorage on page unload
    window.addEventListener('beforeunload', () => {
      try {
        const placeholders: string[] = [];
        ImageCache.loadStatus.forEach((status, url) => {
          if (status === false) {
            placeholders.push(url);
          }
        });
        sessionStorage.setItem('placeholder-urls', JSON.stringify(placeholders));
      } catch (e) {
        console.log('Error saving placeholder cache to session storage', e);
      }
    });
  }
  
  export default ImageCache;