
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
  const maxAttempts = 2;

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
      maxAttempts
    });
    
    // Попытка повторной загрузки с параметром directFetch при первой ошибке
    if (newAttempts < maxAttempts && image) {
      console.log(`Попытка повторной загрузки изображения (${newAttempts}/${maxAttempts})`, image);
      
      // Устанавливаем таймаут, чтобы избежать слишком быстрых повторных попыток
      setTimeout(() => {
        const imgElement = document.querySelector(`img[src="${image}"]`) as HTMLImageElement;
        if (imgElement) {
          // Добавляем параметр для обхода кэша
          let newSrc = image;
          if (image.includes('?')) {
            newSrc = `${image}&directFetch=true&t=${Date.now()}`;
          } else {
            newSrc = `${image}?directFetch=true&t=${Date.now()}`;
          }
          imgElement.src = newSrc;
        }
      }, 1000);
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
