
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage } from '@/services/imageProcessor';

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
  const isProxiedUrl = Boolean(
    imageUrl.includes('corsproxy.io') || 
    imageUrl.includes('cors-anywhere') || 
    imageUrl.includes('proxy.cors')
  );
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isGoogleImage || isZylalabs || isProxiedUrl || imageUrl.includes('encrypted-tbn');
  
  return {
    useAvatar,
    isGoogleImage,
    isZylalabs,
    isProxiedUrl
  };
}
