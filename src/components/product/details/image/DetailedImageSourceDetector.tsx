
import { isGoogleShoppingImage, isGoogleCseImage, isZylalabsImage } from '@/services/imageProcessor';

export interface DetailedImageSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
}

export function detectDetailedImageSource(image: string | null): DetailedImageSourceInfo {
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
  const isProxiedUrl = 
    image.includes('corsproxy.io') || 
    image.includes('cors-anywhere') || 
    image.includes('proxy.cors');
  
  // Определяем, использовать ли Avatar вместо img
  const useAvatar = isGoogleImage || isZylalabs || isProxiedUrl || image.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl
  };
}
