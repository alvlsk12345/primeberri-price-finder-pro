import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { ProductImageModal } from './ProductImageModal';
import { useProductImageLoading } from './image/useProductImageLoading';
import { detectImageSource } from './image/ImageSourceDetector';
import { AvatarProductImage } from './image/AvatarProductImage';
import { StandardProductImage } from './image/StandardProductImage';

interface ProductImageProps {
  image: string | null;
  title: string;
  productId: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, title, productId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const placeholderUrl = getPlaceholderImageUrl(title);
  
  // Используем хук для обработки загрузки изображения
  const imageState = useProductImageLoading(image, productId);
  const { imageError } = imageState;
  
  // Определяем тип источника изображения
  const sourceInfo = detectImageSource(image);
  const { useAvatar } = sourceInfo;
  
  // Обработчик клика по изображению
  const handleImageClick = () => {
    // Открываем модальное окно, только если есть изображение и нет ошибки загрузки
    if (image && !imageError) {
      console.log('Открытие модального окна для изображения:', image);
      setIsModalOpen(true);
    } else {
      console.log('Не удалось открыть модальное окно: нет изображения или ошибки загрузки');
    }
  };

  // Если у нас нет изображения
  if (!image) {
    return (
      <div className="w-full h-[150px] mb-3 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center">
          <ImageOff size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
        </div>
      </div>
    );
  }

  // Выбираем компонент для отображения в зависимости от типа изображения
  return (
    <>
      {useAvatar ? (
        <AvatarProductImage 
          image={image}
          title={title}
          imageState={imageState}
          sourceInfo={sourceInfo}
          onClick={handleImageClick}
        />
      ) : (
        <StandardProductImage
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
        productTitle={title} 
      />
    </>
  );
};
