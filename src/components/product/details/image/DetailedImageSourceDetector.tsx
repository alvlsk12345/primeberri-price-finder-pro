
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy, isImageRequiringProxy } from '@/services/image';

export interface DetailedImageSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
  requiresProxy: boolean;
}

export function detectDetailedImageSource(image: string | null): DetailedImageSourceInfo {
  if (!image) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false,
      requiresProxy: false
    };
  }
  
  // Проверяем источник изображения для применения специальной обработки
  // Улучшенная проверка Google Shopping изображений
  const isGoogleImage = isGoogleShoppingImage(image) || isGoogleCseImage(image);
  const isEncryptedTbn = image.includes('encrypted-tbn');
  const isZylalabs = isZylalabsImage(image);
  
  // Проверяем, является ли URL с прокси
  const isProxiedUrlResult = isUrlWithCorsProxy(image);
  
  // Проверяем, требует ли изображение проксирования
  // Для encrypted-tbn всегда требуется прокси
  const requiresProxy = isImageRequiringProxy(image) || isEncryptedTbn;
  
  // Определяем, использовать ли Avatar вместо img
  // Для Google Shopping изображений и Zylalabs всегда используем Avatar
  const useAvatar = isGoogleImage || isZylalabs || isEncryptedTbn;
  
  console.log(`detectDetailedImageSource: URL=${image?.substring(0, 60)}..., 
    isGoogleImage=${isGoogleImage}, 
    isZylalabs=${isZylalabs}, 
    isEncryptedTbn=${isEncryptedTbn}, 
    requiresProxy=${requiresProxy}, 
    useAvatar=${useAvatar}`);
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    requiresProxy
  };
}
