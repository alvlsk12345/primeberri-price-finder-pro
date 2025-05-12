
import { 
  isZylalabsImage, 
  isGoogleCseImage, 
  isGoogleShoppingImage, 
  isGoogleThumbnail,
  isUrlWithCorsProxy 
} from '@/services/image';

export interface ImageModalSourceInfo {
  useAvatar: boolean;
  isGoogleImage: boolean;
  isZylalabs: boolean;
  isProxiedUrl: boolean;
  isGoogleThumbnail: boolean;
}

export function useImageModalSource(imageUrl: string | null): ImageModalSourceInfo {
  if (!imageUrl) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false,
      isGoogleThumbnail: false
    };
  }
  
  // Проверяем источник изображения для специальной обработки
  const isGoogleImage = isGoogleShoppingImage(imageUrl) || isGoogleCseImage(imageUrl);
  const isZylalabs = isZylalabsImage(imageUrl);
  const isGoogleThumb = isGoogleThumbnail(imageUrl);
  
  // Проверяем, является ли URL с прокси
  const isProxiedUrlResult = isUrlWithCorsProxy(imageUrl);
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isGoogleImage || isZylalabs || isGoogleThumb || imageUrl.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    isGoogleThumbnail: isGoogleThumb
  };
}
