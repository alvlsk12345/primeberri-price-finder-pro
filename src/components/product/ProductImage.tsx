
import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlaceholderImageUrl } from '@/services/imageService';

interface ProductImageProps {
  image: string | null;
  title: string;
  productId: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, title, productId }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Проверяем, является ли изображение от Google Shopping
  const isGoogleImage = image && (image.includes('encrypted-tbn') || image.includes('googleusercontent.com'));

  // Получаем URL заглушки для отображения при ошибке или отсутствии изображения
  const placeholderUrl = getPlaceholderImageUrl(title);

  // Обработчик для ошибок загрузки изображений
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения для товара:', productId, image);
    setImageLoading(false);
    setImageError(true);
  };

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение успешно загружено:', image);
    setImageLoading(false);
    setImageError(false);
  };

  // Если у нас нет изображения или произошла ошибка загрузки
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

  return (
    <div className="w-full h-[150px] mb-3 flex items-center justify-center relative">
      {imageLoading && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      {isGoogleImage ? (
        // Для изображений Google используем Avatar компонент, который лучше справляется с такими изображениями
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={image} 
            alt={title}
            className="object-contain"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
            <div className="flex flex-col items-center justify-center">
              <ImageOff size={32} className="text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
            </div>
          </AvatarFallback>
        </Avatar>
      ) : (
        // Для обычных изображений используем стандартный тег img с запасным URL при ошибке
        <img 
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            // При ошибке устанавливаем заглушку
            e.currentTarget.onerror = null; // Предотвращение бесконечной рекурсии
            e.currentTarget.src = placeholderUrl;
            handleImageError();
          }}
          onLoad={handleImageLoad}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={24} className="text-gray-500" />
            <p className="text-xs text-gray-600 mt-1">Ошибка загрузки</p>
          </div>
        </div>
      )}
    </div>
  );
};
