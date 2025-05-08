
import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductImageProps {
  image: string | null;
  title: string;
  productId: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, title, productId }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Обработчик для ошибок загрузки изображений
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения для товара:', productId);
    setImageLoading(false);
    setImageError(true);
  };

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <div className="w-full h-[150px] mb-3 flex items-center justify-center relative">
      {imageLoading && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      {imageError || !image ? (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100">
          <ImageOff size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
        </div>
      ) : (
        <img 
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain"
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
};
