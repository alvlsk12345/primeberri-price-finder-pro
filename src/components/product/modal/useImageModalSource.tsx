
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
  needsDirectFetch: boolean;  // Флаг для прямой загрузки, минуя кэш
}

export function useImageModalSource(imageUrl: string | null): ImageModalSourceInfo {
  if (!imageUrl) {
    return {
      useAvatar: false,
      isGoogleImage: false,
      isZylalabs: false,
      isProxiedUrl: false,
      isGoogleThumbnail: false,
      needsDirectFetch: false
    };
  }
  
  // Проверяем источник изображения для специальной обработки
  const isGoogleImage = isGoogleShoppingImage(imageUrl) || isGoogleCseImage(imageUrl);
  const isZylalabs = isZylalabsImage(imageUrl);
  const isGoogleThumb = isGoogleThumbnail(imageUrl);
  
  // Проверяем, является ли URL с прокси
  const isProxiedUrlResult = isUrlWithCorsProxy(imageUrl);
  
  // Определяем, нужен ли directFetch для некоторых проблемных источников
  // Для Zylalabs и Google Thumbnails ВСЕГДА используем принудительный directFetch=true
  const needsDirectFetch = isZylalabs || isGoogleThumb || imageUrl.includes('encrypted-tbn');
  
  // Решаем, использовать ли Avatar компонент для изображения
  // Теперь включаем все миниатюры Google (encrypted-tbn)
  const useAvatar = isGoogleImage || isZylalabs || isGoogleThumb || imageUrl.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl: isProxiedUrlResult,
    isGoogleThumbnail: isGoogleThumb,
    needsDirectFetch
  };
}
