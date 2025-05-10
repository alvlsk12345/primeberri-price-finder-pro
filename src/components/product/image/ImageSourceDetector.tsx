
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isProxiedUrl } from '@/services/image';

export interface ImageSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
}

export function detectImageSource(image: string | null): ImageSourceInfo {
  if (!image) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false
    };
  }
  
  // Проверяем источник изображения для применения специальной обработки
  const isGoogleImage = isGoogleShoppingImage(image) || isGoogleCseImage(image);
  const isZylalabs = isZylalabsImage(image);
  
  // Проверяем, является ли URL с CORS-прокси
  const isProxiedUrlResult = isProxiedUrl(image);
  
  // Определяем, использовать ли Avatar вместо img
  const useAvatar = isGoogleImage || isZylalabs || isProxiedUrlResult || image.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult
  };
}
