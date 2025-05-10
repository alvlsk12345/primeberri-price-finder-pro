
import React from 'react';
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlaceholderImageUrl } from '@/services/imageService';
import { ImageLoadingState } from './useProductImageLoading';

interface StandardProductImageProps {
  image: string;
  title: string;
  imageState: ImageLoadingState;
  onClick: () => void;
}

export const StandardProductImage: React.FC<StandardProductImageProps> = ({
  image,
  title,
  imageState,
  onClick
}) => {
  const { imageLoading, imageError, handleImageLoad, handleImageError } = imageState;
  
  // Получаем URL заглушки для отображения при ошибке
  const placeholderUrl = getPlaceholderImageUrl(title);

  return (
    <div 
      className="w-full h-[150px] mb-3 flex items-center justify-center relative cursor-pointer" 
      onClick={onClick}
    >
      {imageLoading && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      <img 
        src={image}
        alt={title}
        className="max-h-full max-w-full object-contain hover:opacity-90 transition-opacity"
        onError={(e) => {
          // При ошибке устанавливаем заглушку
          console.error('Ошибка загрузки изображения, устанавливаем заглушку:', image);
          e.currentTarget.onerror = null; // Предотвращение бесконечной рекурсии
          e.currentTarget.src = placeholderUrl;
          handleImageError();
        }}
        onLoad={handleImageLoad}
        loading="lazy"
        crossOrigin="anonymous"
      />
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={24} className="text-gray-500" />
            <p className="text-xs text-gray-600 mt-1">Ошибка загрузки</p>
          </div>
        </div>
      )}
      
      {!imageError && !imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
          <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
            Увеличить
          </div>
        </div>
      )}
    </div>
  );
};
