
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
  const isGoogleImage = isGoogleShoppingImage(image) || isGoogleCseImage(image);
  const isZylalabs = isZylalabsImage(image);
  const isEncryptedTbn = image.includes('encrypted-tbn');
  
  // Проверяем, является ли URL с прокси
  const isProxiedUrlResult = isUrlWithCorsProxy(image);
  
  // Проверяем, требует ли изображение проксирования
  const requiresProxy = isImageRequiringProxy(image);
  
  // Определяем, использовать ли Avatar вместо img
  const useAvatar = isGoogleImage || isZylalabs || isEncryptedTbn;
  
  console.log(`detectDetailedImageSource: URL=${image?.substring(0, 60)}..., isGoogleImage=${isGoogleImage}, isZylalabs=${isZylalabs}, isEncryptedTbn=${isEncryptedTbn}, requiresProxy=${requiresProxy}`);
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    requiresProxy
  };
}
