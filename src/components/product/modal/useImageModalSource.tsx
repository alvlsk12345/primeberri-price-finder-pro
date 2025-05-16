
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy, isImageRequiringProxy } from '@/services/image';

export interface ImageModalSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
  requiresProxy: boolean;
}

export function useImageModalSource(imageUrl: string | null): ImageModalSourceInfo {
  if (!imageUrl) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false,
      requiresProxy: false
    };
  }
  
  // Проверяем источник изображения для специальной обработки
  const isGoogleImage = isGoogleShoppingImage(imageUrl) || isGoogleCseImage(imageUrl);
  const isZylalabs = isZylalabsImage(imageUrl);
  const isEncryptedTbn = imageUrl.includes('encrypted-tbn');
  
  // Проверяем, является ли URL с прокси
  const isProxiedUrlResult = isUrlWithCorsProxy(imageUrl);
  
  // Проверяем, требует ли изображение проксирования
  const requiresProxy = isImageRequiringProxy(imageUrl);
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isGoogleImage || isZylalabs || isEncryptedTbn;
  
  console.log(`useImageModalSource: URL=${imageUrl?.substring(0, 60)}..., isGoogleImage=${isGoogleImage}, isZylalabs=${isZylalabs}, isEncryptedTbn=${isEncryptedTbn}, requiresProxy=${requiresProxy}`);
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    requiresProxy
  };
}
