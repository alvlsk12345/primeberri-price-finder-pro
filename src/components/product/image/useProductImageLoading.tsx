
import { useState, useEffect } from 'react';

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

  // Сбрасываем состояние при изменении URL изображения
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [image]);

  // Детальное логирование для отладки
  useEffect(() => {
    if (image) {
      console.log(`Инициализация изображения для товара ${productId}:`, {
        image
      });
    }
  }, [image, productId]);

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение успешно загружено:', {
      productId,
      imageUrl: image
    });
    setImageLoading(false);
    setImageError(false);
  };

  // Обработчик для ошибок загрузки изображений с улучшенной диагностикой
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения для товара:', {
      productId,
      imageUrl: image
    });
    
    setImageLoading(false);
    setImageError(true);
  };

  return {
    imageLoading,
    imageError,
    handleImageLoad,
    handleImageError
  };
}
