
import { useState, useEffect } from 'react';

export interface DetailedImageLoadingState {
  imageLoading: boolean;
  imageError: boolean;
  handleImageLoad: () => void;
  handleImageError: () => void;
}

export function useDetailedImageLoading(image: string | null): DetailedImageLoadingState {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Сбрасываем состояние при изменении URL изображения
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [image]);

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Детальное изображение товара успешно загружено:', image);
    setImageLoading(false);
    setImageError(false);
  };

  // Обработчик для ошибок загрузки изображения
  const handleImageError = () => {
    console.error('Ошибка загрузки детального изображения товара:', {
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
