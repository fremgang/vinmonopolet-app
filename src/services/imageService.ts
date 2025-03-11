// src/services/imageService.ts
import { Product } from '@/types';

// Available image sizes
export type ImageSize = 'tiny' | 'small' | 'medium' | 'large';

// Image format options
export type ImageFormat = 'jpg' | 'webp' | 'avif';

// Image service configuration
interface ImageServiceConfig {
  useCache: boolean;
  defaultSize: ImageSize;
  preferredFormat: ImageFormat;
  cacheTTL: number; // in seconds
  basePath: string;
}

// Default configuration
const defaultConfig: ImageServiceConfig = {
  useCache: true,
  defaultSize: 'small',
  preferredFormat: 'webp',
  cacheTTL: 86400 * 30, // 30 days
  basePath: '/api/products/image-cache'
};

// Size dimensions mapping
export const IMAGE_DIMENSIONS = {
  tiny: { width: 100, height: 100 },
  small: { width: 300, height: 300 },
  medium: { width: 515, height: 515 },
  large: { width: 800, height: 800 }
};

// The main image service
class ImageService {
  private config: ImageServiceConfig;
  
  constructor(config: Partial<ImageServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * Get a cached image URL for a product
   */
  getProductImageUrl(
    product: Product, 
    options: { 
      size?: ImageSize; 
      format?: ImageFormat;
      skipCache?: boolean;
    } = {}
  ): string {
    // Handle missing image
    if (!product?.imageMain) {
      return this.getPlaceholderUrl(options.size || this.config.defaultSize);
    }
    
    const size = options.size || this.config.defaultSize;
    const format = options.format || this.config.preferredFormat;
    const skipCache = options.skipCache || false;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('url', encodeURIComponent(product.imageMain));
    params.append('size', size);
    
    if (format === 'webp') {
      params.append('webp', 'true');
    } else if (format === 'avif') {
      params.append('avif', 'true');
    }
    
    if (skipCache) {
      params.append('skipCache', 'true');
    }
    
    return `${this.config.basePath}?${params.toString()}`;
  }
  
  /**
   * Get a direct URL to Vinmonopolet image
   */
  getDirectImageUrl(productId: string, size: ImageSize = 'medium'): string {
    const sizeSuffix = this.getSizeSuffix(size);
    return `https://bilder.vinmonopolet.no/cache/${sizeSuffix}/${productId}-1.jpg`;
  }
  
  /**
   * Get a placeholder image URL for missing images
   */
  getPlaceholderUrl(size: ImageSize = 'small'): string {
    const { width, height } = IMAGE_DIMENSIONS[size];
    return `/api/placeholder?width=${width}&height=${height}`;
  }
  
  /**
   * Convert size to Vinmonopolet's size code
   */
  getSizeSuffix(size: ImageSize): string {
    switch (size) {
      case 'tiny': return '100x100-0';
      case 'small': return '300x300-0';
      case 'medium': return '515x515-0';
      case 'large': return '800x800-0';
      default: return '300x300-0';
    }
  }
  
  /**
   * Get image dimensions for a specific size
   */
  getImageDimensions(size: ImageSize) {
    return IMAGE_DIMENSIONS[size];
  }
  
  /**
   * Check if an image is likely to exist
   */
  async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Update service configuration
   */
  updateConfig(config: Partial<ImageServiceConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Create and export a singleton instance
const imageService = new ImageService();
export default imageService;

// Also export the class for testing and custom instances
export { ImageService };