
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface StandardProductImageProps {
  image: string;
  title: string;
  imageState: {
    imageLoading: boolean;
    imageError: boolean;
  };
  onClick: () => void;
}

export const StandardProductImage: React.FC<StandardProductImageProps> = ({
  image,
  title,
  imageState,
  onClick
}) => {
  const { imageLoading, imageError } = imageState;
  
  // Используем loading="lazy" для изображений, чтобы 
  // браузер загружал их только при необходимости
  return (
    <div 
      className="relative w-full h-[150px] mb-3 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {imageLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {imageError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <ImageOff size={24} className="text-gray-400" />
          <p className="text-xs text-gray-500 mt-1">Ошибка загрузки</p>
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          className={`object-contain w-full h-full transition-opacity duration-200 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy" // Добавляем lazy loading
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </div>
  );
}
