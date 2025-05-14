
import { useState, useEffect } from 'react';
import { markImageAsLoaded, isImageLoaded } from '@/services/image/imageCache';
import { isZylalabsImage } from '@/services/image/imageSourceDetector';

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
  const [isZylalabsImg, setIsZylalabsImg] = useState(false);
  const maxAttempts = 4; // Используем 4 попытки загрузки
  
  // Определяем тип изображения при монтировании
  useEffect(() => {
    if (image) {
      const isZyla = isZylalabsImage(image);
      setIsZylalabsImg(isZyla);
      
      // Логируем информацию о типе изображения
      console.log(`Информация об изображении для товара ${productId}:`, {
        isZylalabsImage: isZyla,
        image: image.substring(0, 100) // Только начало URL для краткости лога
      });
    }
  }, [image, productId]);

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

  // Предзагрузка изображения (особенно для Zylalabs)
  useEffect(() => {
    if (image && isZylalabsImg) {
      // Создаем скрытый элемент изображения для предзагрузки
      const preloadImg = new Image();
      
      // Устанавливаем обработчики событий
      preloadImg.onload = () => {
        console.log(`Предзагрузка изображения Zylalabs успешна: ${image.substring(0, 50)}...`);
        markImageAsLoaded(image);
        setImageLoading(false);
        setImageError(false);
      };
      
      preloadImg.onerror = () => {
        console.error(`Ошибка предзагрузки изображения Zylalabs: ${image.substring(0, 50)}...`);
      };
      
      // Начинаем загрузку
      preloadImg.src = image;
      
      // Очистка при размонтировании
      return () => {
        preloadImg.onload = null;
        preloadImg.onerror = null;
      };
    }
  }, [image, isZylalabsImg]);

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение успешно загружено:', {
      productId,
      isZylalabs: isZylalabsImg,
      imageUrl: image?.substring(0, 50),
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
      imageUrl: image?.substring(0, 50),
      attempt: newAttempts,
      maxAttempts,
      isZylalabs: isZylalabsImg
    });
    
    // Не запускаем автоматическую повторную загрузку здесь 
    // Вместо этого обработка перенесена в компоненты AvatarProductImage/StandardProductImage
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
