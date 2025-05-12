
import { useState, useEffect } from 'react';
import { markImageAsLoaded, isImageLoaded } from '@/services/image/imageCache';

export interface ImageLoadingState {
  imageLoading: boolean;
  imageError: boolean;
  handleImageLoad: () => void;
  handleImageError: () => void;
}

export function useProductImageLoading(
  image: string | null, 
  productId: string
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
        loadAttempts
      });
    }
  }, [image, imageLoading, imageError, loadAttempts, productId]);

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
    
    console.error('Ошибка загрузки изображения для товара:', {
      productId,
      imageUrl: image,
      attempt: newAttempts,
      maxAttempts,
      isZylalabs: image?.includes('zylalabs.com'),
      isProxy: image?.includes('image-proxy'),
      directFetch: image?.includes('directFetch=true')
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
          
          // Добавляем параметр timestamp для предотвращения кэширования браузером
          const timestamp = Date.now();
          if (image.includes('?')) {
            newSrc = `${image}&t=${timestamp}&retryAttempt=${newAttempts}`;
          } else {
            newSrc = `${image}?t=${timestamp}&retryAttempt=${newAttempts}`;
          }
          
          // Добавляем параметр directFetch для обхода кэша при проблемах
          if (!newSrc.includes('directFetch=true')) {
            newSrc += '&directFetch=true';
          }
          
          imgElement.src = newSrc;
          
          console.log(`Изображение запрошено повторно с src:`, {
            originalSrc: image,
            newSrc: newSrc,
            delay
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
