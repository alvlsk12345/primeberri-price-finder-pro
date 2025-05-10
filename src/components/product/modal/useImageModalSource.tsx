
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage, isProxiedUrl } from '@/services/image';

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
  
  // Проверяем, является ли URL уже проксированным
  const isProxiedUrlResult = isProxiedUrl(imageUrl);
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isGoogleImage || isZylalabs || isProxiedUrlResult || imageUrl.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult
  };
}
