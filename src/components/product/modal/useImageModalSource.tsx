
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isUrlWithCorsProxy } from '@/services/image';

export interface ImageModalSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
}

export function useImageModalSource(imageUrl: string | null): ImageModalSourceInfo {
  if (!imageUrl) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false
    };
  }
  
  // Проверяем источник изображения для специальной обработки
  const isGoogleImage = isGoogleShoppingImage(imageUrl) || isGoogleCseImage(imageUrl);
  const isZylalabs = isZylalabsImage(imageUrl);
  
  // С удалением CORS-прокси эта функция всегда возвращает false
  const isProxiedUrlResult = false;
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isGoogleImage || isZylalabs || imageUrl.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult
  };
}
