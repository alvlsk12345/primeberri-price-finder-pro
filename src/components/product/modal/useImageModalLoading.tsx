
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
  
  // Сбрасываем состояния при изменении URL
  useEffect(() => {
    if (imageUrl) {
      console.log('Сброс состояния загрузки для модального изображения:', imageUrl.substring(0, 100));
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageUrl]);
  
  // Обработчик успешной загрузки
  const handleImageLoad = () => {
    console.log('Изображение в модальном окне успешно загружено');
    setImageLoading(false);
    setImageError(false);
  };
  
  // Обработчик ошибки загрузки с улучшенным логированием
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения в модальном окне:', {
      imageUrl: imageUrl?.substring(0, 100),
      wasLoading: imageLoading,
      previousError: imageError
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
