
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy } from '@/services/image';

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
  
  // С удалением CORS-прокси эта функция всегда возвращает false
  const isProxiedUrlResult = false;
  
  // Определяем, использовать ли Avatar вместо img
  const useAvatar = isGoogleImage || isZylalabs || image.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult
  };
}
