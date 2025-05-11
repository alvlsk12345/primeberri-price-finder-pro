
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy } from '@/services/image';

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
  
  // С удалением CORS-прокси эта функция всегда возвращает false
  const isProxiedUrlResult = isUrlWithCorsProxy(image);
  
  // Определяем, использовать ли Avatar вместо img
  // Для Google Shopping и других проблемных изображений все еще используем Avatar
  const useAvatar = isGoogleImage || isZylalabs || image.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult
  };
}
