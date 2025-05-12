
import { 
  isZylalabsImage, 
  isGoogleCseImage, 
  isGoogleShoppingImage, 
  isGoogleThumbnail,
  isUrlWithCorsProxy,
  isProxiedUrl,
  getUrlParam
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
  
  // Начальные флаги для прямого URL
  let isGoogleImage = isGoogleShoppingImage(imageUrl) || isGoogleCseImage(imageUrl);
  let isZylalabs = isZylalabsImage(imageUrl);
  let isGoogleThumb = isGoogleThumbnail(imageUrl);
  
  // Проверяем, является ли URL проксированным
  const isPrxUrl = isProxiedUrl(imageUrl);
  
  // Если URL проксирован, проверяем оригинальный URL внутри него
  if (isPrxUrl) {
    try {
      const originalUrl = getUrlParam(imageUrl, 'url');
      if (originalUrl) {
        // Проверяем оригинальный URL на типы источников
        isGoogleImage = isGoogleImage || isGoogleShoppingImage(originalUrl) || isGoogleCseImage(originalUrl);
        isZylalabs = isZylalabs || isZylalabsImage(originalUrl);
        isGoogleThumb = isGoogleThumb || isGoogleThumbnail(originalUrl) || originalUrl.includes('encrypted-tbn');
      }
    } catch (e) {
      console.error('Ошибка при анализе проксированного URL:', e);
    }
  }
  
  // Дополнительная проверка для Google Thumbnails по строке encrypted-tbn
  if (!isGoogleThumb && imageUrl.includes('encrypted-tbn')) {
    isGoogleThumb = true;
    isGoogleImage = true;
  }
  
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
    isProxiedUrl: isPrxUrl,
    isGoogleThumbnail: isGoogleThumb,
    needsDirectFetch
  };
}
