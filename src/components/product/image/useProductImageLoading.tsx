
import { useState, useEffect } from 'react';
import { markImageAsLoaded, isImageLoaded } from '@/services/image/imageCache';
import { getProxiedImageUrl } from '@/services/image/imageProxy';
import { isZylalabsImage, isGoogleThumbnail } from '@/services/image';

export interface ImageLoadingState {
  imageLoading: boolean;
  imageError: boolean;
  handleImageLoad: () => void;
  handleImageError: () => void;
}

export function useProductImageLoading(
  image: string | null, 
  productId: string,
  needsDirectFetch: boolean = false
): ImageLoadingState {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const maxAttempts = 4; // Увеличиваем с 2 до 4

  // Сбрасываем состояние при изменении URL изображения
  useEffect(() => {
    if (image) {
      // Проверяем, было ли изображение уже загружено ранее
      const alreadyLoaded = isImageLoaded(image);
      setImageLoading(!alreadyLoaded);
      setImageError(false);
      setLoadAttempts(0); // Сбрасываем счетчик попыток
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  }, [image]);

  // Детальное логирование для отладки
  useEffect(() => {
    if (image) {
      console.log(`Инициализация изображения для товара ${productId}:`, {
        image,
        loading: imageLoading,
        error: imageError,
        loadAttempts,
        isZylalabs: isZylalabsImage(image),
        isGoogleThumb: isGoogleThumbnail(image),
        needsDirectFetch
      });
    }
  }, [image, imageLoading, imageError, loadAttempts, productId, needsDirectFetch]);

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение успешно загружено:', {
      productId,
      imageUrl: image,
      attempts: loadAttempts + 1
    });
    
    // Сохраняем информацию об успешной загрузке в кэш
    if (image) {
      markImageAsLoaded(image);
    }
    
    setImageLoading(false);
    setImageError(false);
  };

  // Обработчик для ошибок загрузки изображений с улучшенной диагностикой
  const handleImageError = () => {
    const newAttempts = loadAttempts + 1;
    setLoadAttempts(newAttempts);
    
    // Определяем тип изображения для лучшей диагностики
    const isZylalabsImg = image ? isZylalabsImage(image) : false;
    const isGoogleThumbImg = image ? isGoogleThumbnail(image) : false;
    
    console.error('Ошибка загрузки изображения для товара:', {
      productId,
      imageUrl: image,
      attempt: newAttempts,
      maxAttempts,
      isZylalabs: isZylalabsImg,
      isGoogleThumb: isGoogleThumbImg,
      isProxy: image?.includes('image-proxy'),
      directFetch: needsDirectFetch || image?.includes('directFetch=true')
    });
    
    // Попытка повторной загрузки с параметром directFetch при первой ошибке
    if (newAttempts < maxAttempts && image) {
      console.log(`Попытка повторной загрузки изображения (${newAttempts}/${maxAttempts})`, image);
      
      // Устанавливаем экспоненциальную задержку между попытками
      const delay = Math.min(300 * Math.pow(2, newAttempts - 1), 3000);
      
      setTimeout(() => {
        const imgElement = document.querySelector(`img[src="${image}"]`) as HTMLImageElement;
        if (imgElement) {
          // Добавляем параметр для обхода кэша
          let newSrc = image;
          
          // Для первой повторной попытки с Zylalabs или Google Thumbnail, пробуем использовать прокси
          if (newAttempts === 1 && (isZylalabsImg || isGoogleThumbImg) && !image.includes('image-proxy')) {
            newSrc = getProxiedImageUrl(image, true, true);
          } else {
            // Для остальных случаев добавляем параметр timestamp
            const timestamp = Date.now();
            if (image.includes('?')) {
              newSrc = `${image}&t=${timestamp}&retryAttempt=${newAttempts}`;
            } else {
              newSrc = `${image}?t=${timestamp}&retryAttempt=${newAttempts}`;
            }
            
            // Добавляем параметр directFetch и forceDirectFetch для обхода кэша при проблемах
            if (isZylalabsImg || isGoogleThumbImg) {
              if (!newSrc.includes('directFetch=true')) {
                newSrc += '&directFetch=true&forceDirectFetch=true';
              }
            }
          }
          
          imgElement.src = newSrc;
          
          console.log(`Изображение запрошено повторно с src:`, {
            originalSrc: image,
            newSrc: newSrc,
            delay,
            isZylalabs: isZylalabsImg,
            isGoogleThumb: isGoogleThumbImg
          });
        }
      }, delay);
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  };

  return {
    imageLoading,
    imageError,
    handleImageLoad,
    handleImageError
  };
}
