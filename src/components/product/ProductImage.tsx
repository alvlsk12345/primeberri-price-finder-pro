
import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { ProductImageModal } from './ProductImageModal';
import { useProductImageLoading } from './image/useProductImageLoading';
import { detectImageSource } from './image/ImageSourceDetector';
import { AvatarProductImage } from './image/AvatarProductImage';
import { StandardProductImage } from './image/StandardProductImage';
import { isGoogleThumbnail, isZylalabsImage } from '@/services/image';
import { getOptimizedZylalabsImageUrl } from '@/services/image/zylalabsImageProcessor';
import { toast } from "sonner";

interface ProductImageProps {
  image: string | null;
  title: string;
  productId: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, title, productId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const placeholderUrl = getPlaceholderImageUrl(title);
  
  // Оптимизируем URL изображения
  let optimizedImageUrl = image;
  
  // Для Zylalabs применяем специальную обработку
  if (image && isZylalabsImage(image)) {
    optimizedImageUrl = getOptimizedZylalabsImageUrl(image);
    console.log('Применена оптимизация для Zylalabs изображения:', {
      original: image,
      optimized: optimizedImageUrl
    });
  }
  
  // Для Google Thumbnails также применяем специальную обработку
  if (image && isGoogleThumbnail(image)) {
    // Для миниатюр применяем прокси с forceDirectFetch=true
    if (!optimizedImageUrl?.includes('forceDirectFetch=true')) {
      console.log('Обнаружена миниатюра Google (encrypted-tbn), применяем специальную обработку');
    }
  }
  
  // Определяем, требуется ли directFetch для проблемных источников
  const needsDirectFetch = optimizedImageUrl ? 
    (isZylalabsImage(optimizedImageUrl) || isGoogleThumbnail(optimizedImageUrl)) : false;
  
  // Используем хук для обработки загрузки изображения с учетом типа изображения
  const imageState = useProductImageLoading(optimizedImageUrl, productId, needsDirectFetch);
  const { imageError } = imageState;
  
  // Определяем тип источника изображения
  const sourceInfo = detectImageSource(optimizedImageUrl);
  const { useAvatar } = sourceInfo;
  
  // Обработчик клика по изображению
  const handleImageClick = () => {
    // Открываем модальное окно, только если есть изображение и нет ошибки загрузки
    if (optimizedImageUrl && !imageError) {
      console.log('Открытие модального окна для изображения:', optimizedImageUrl);
      setIsModalOpen(true);
      
      if (isZylalabsImage(optimizedImageUrl)) {
        toast.info("Загрузка изображения Zylalabs", {
          description: "Используется специальная обработка для API Zylalabs"
        });
      } else if (isGoogleThumbnail(optimizedImageUrl)) {
        toast.info("Загрузка миниатюры Google", {
          description: "Используется специальная обработка для миниатюр"
        });
      }
    } else {
      console.log('Не удалось открыть модальное окно: нет изображения или ошибки загрузки');
    }
  };

  // Если у нас нет изображения
  if (!optimizedImageUrl) {
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
          image={optimizedImageUrl}
          title={title}
          imageState={imageState}
          sourceInfo={sourceInfo}
          onClick={handleImageClick}
        />
      ) : (
        <StandardProductImage
          image={optimizedImageUrl}
          title={title}
          imageState={imageState}
          onClick={handleImageClick}
        />
      )}
      
      <ProductImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imageError ? placeholderUrl : optimizedImageUrl} 
        productTitle={title} 
      />
    </>
  );
};
