export function getProductImageUrl(productId: string, size = 'medium') {
    // Keep using the original vinmonopolet domain
    const sizeSuffix = size === 'small' ? '300x300-0' : 
                      size === 'medium' ? '515x515-0' : 
                      size === 'large' ? '800x800-0' : '300x300-0';
    
    return `https://bilder.vinmonopolet.no/cache/${sizeSuffix}/${productId}-1.jpg`;
  }