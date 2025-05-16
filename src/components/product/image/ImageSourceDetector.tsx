
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy, isImageRequiringProxy } from '@/services/image';

export interface ImageSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
  requiresProxy: boolean;
}

export function detectImageSource(image: string | null): ImageSourceInfo {
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
  // Для Google Shopping, encrypted-tbn и других проблемных изображений используем Avatar
  const useAvatar = isGoogleImage || isZylalabs || isEncryptedTbn;
  
  console.log(`detectImageSource: URL=${image?.substring(0, 60)}..., isGoogleImage=${isGoogleImage}, isZylalabs=${isZylalabs}, isEncryptedTbn=${isEncryptedTbn}, requiresProxy=${requiresProxy}`);
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    requiresProxy
  };
}
