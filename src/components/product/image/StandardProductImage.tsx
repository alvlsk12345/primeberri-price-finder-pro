
import React, { useState } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  // Функция для повторной попытки загрузки изображения
  const retryImageLoad = () => {
    if (retryCount < maxRetries) {
      console.log(`Повторная попытка загрузки изображения (${retryCount + 1}/${maxRetries})`, image);
      setRetryCount(prev => prev + 1);
      
      // Принудительно перезагружаем изображение с новым параметром временного штампа
      const imgElement = document.querySelector(`img[src="${image}"]`) as HTMLImageElement;
      if (imgElement) {
        const timestamp = Date.now();
        let newSrc = image;
        
        // Добавляем параметр для предотвращения кэширования браузером
        if (image.includes('?')) {
          newSrc += `&t=${timestamp}`;
        } else {
          newSrc += `?t=${timestamp}`;
        }
        
        // Добавляем параметр directFetch для обхода кэша при проблемах
        if (!newSrc.includes('directFetch=true')) {
          newSrc += '&directFetch=true';
        }
        
        imgElement.src = newSrc;
      }
    }
  };
  
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
          {retryCount < maxRetries && (
            <button 
              className="text-xs text-blue-500 mt-1 hover:underline" 
              onClick={(e) => {
                e.stopPropagation();
                retryImageLoad();
              }}
            >
              Повторить загрузку
            </button>
          )}
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          className={`object-contain w-full h-full transition-opacity duration-200 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Ошибка загрузки изображения:', image);
            
            // Проверяем, можем ли повторить попытку загрузки
            if (retryCount < maxRetries) {
              retryImageLoad();
            } else {
              // Если исчерпаны попытки, скрываем изображение
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      )}
    </div>
  );
}
