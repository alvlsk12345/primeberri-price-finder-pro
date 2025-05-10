
import { useState, useEffect } from 'react';

export interface ImageModalLoadingState {
  imageLoading: boolean;
  imageError: boolean;
  handleImageLoad: () => void;
  handleImageError: () => void;
}

export function useImageModalLoading(imageUrl: string | null): ImageModalLoadingState {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Сбрасываем состояние при изменении URL изображения
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log('Изображение в модальном окне успешно загружено:', imageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Ошибка загрузки изображения в модальном окне:', imageUrl);
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
