
import React, { useState } from 'react';
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { ProductImageModal } from '../ProductImageModal';
import { useDetailedImageLoading } from './image/useDetailedImageLoading';
import { detectDetailedImageSource } from './image/DetailedImageSourceDetector';
import { DetailedAvatarImage } from './image/DetailedAvatarImage';
import { DetailedStandardImage } from './image/DetailedStandardImage';
import { DetailedNoImage } from './image/DetailedNoImage';

interface ProductDetailsImageProps {
  image: string | null;
  title: string | null;
}

export const ProductDetailsImage: React.FC<ProductDetailsImageProps> = ({ 
  image, 
  title 
}) => {
  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Получаем URL заглушки для случая ошибки
  const placeholderUrl = title ? getPlaceholderImageUrl(title) : '';
  
  // Используем хук для обработки загрузки изображения
  const imageState = useDetailedImageLoading(image);
  const { imageError } = imageState;
  
  // Получаем информацию об источнике изображения
  const sourceInfo = detectDetailedImageSource(image);
  const { useAvatar } = sourceInfo;

  // Обработчик клика по изображению
  const handleImageClick = () => {
    // Открываем модальное окно только если есть изображение и нет ошибки загрузки
    if (image && !imageError) {
      console.log('Открытие модального окна для детального изображения:', image);
      setIsModalOpen(true);
    } else {
      console.log('Не удалось открыть модальное окно для детального изображения: нет изображения или ошибка загрузки');
    }
  };

  React.useEffect(() => {
    console.log('Инициализация ProductDetailsImage:', {
      image,
      title,
      useAvatar
    });
  }, [image, title, useAvatar]);
  
  if (!image) {
    return <DetailedNoImage />;
  }
  
  return (
    <>
      {useAvatar ? (
        <DetailedAvatarImage 
          image={image}
          title={title}
          imageState={imageState}
          sourceInfo={sourceInfo}
          onClick={handleImageClick}
        />
      ) : (
        <DetailedStandardImage
          image={image}
          title={title}
          imageState={imageState}
          onClick={handleImageClick}
        />
      )}
      
      <ProductImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imageError ? placeholderUrl : image} 
        productTitle={title || "Товар"} 
      />
    </>
  );
};
