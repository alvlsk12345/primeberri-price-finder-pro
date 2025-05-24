import React, { useState, useEffect } from 'react';
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
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 4; // Увеличиваем максимальное количество попыток с 2 до 4
  
  // Состояние для отслеживания ошибок загрузки
  const [loadingErrors, setLoadingErrors] = useState<any[]>([]);
  
  // Сбрасываем состояние при изменении URL изображения
  useEffect(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLoadingErrors([]);
  }, [image]);
  
  // Функция для повторной попытки загрузки изображения с экспоненциальной задержкой
  const retryImageLoad = () => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      
      // Устанавливаем задержку с экспоненциальным ростом
      const delay = 300 * Math.pow(2, retryCount);
      console.log(`Повторная попытка загрузки изображения (${retryCount + 1}/${maxRetries}) через ${delay}мс`, image);
      
      setTimeout(() => {
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
          
          // Добавляем параметр retryAttempt для отслеживания попыток
          newSrc += `&retryAttempt=${retryCount + 1}`;
          
          imgElement.src = newSrc;
          
          // Логируем более подробную информацию о попытке
          console.log(`Попытка ${retryCount + 1}/${maxRetries} загрузки изображения:`, {
            originalUrl: image,
            newUrl: newSrc,
            errors: loadingErrors
          });
        }
        
        // Сбрасываем флаг попытки загрузки через небольшой промежуток времени
        setTimeout(() => {
          setIsRetrying(false);
        }, 1000);
      }, delay);
    }
  };
  
  return (
    <div 
      className="relative w-full aspect-[4/3] mb-3 cursor-pointer overflow-hidden bg-gray-50"
      onClick={onClick}
    >
      {(imageLoading || isRetrying) && (
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
          {retryCount > 0 && (
            <p className="text-xs text-gray-400 mt-1">Попытка {retryCount}/{maxRetries}</p>
          )}
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          className={`object-contain w-full h-full transition-opacity duration-200 ${
            imageLoading || isRetrying ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
          onError={(e) => {
            const errorInfo = {
              timestamp: new Date().toISOString(),
              imageUrl: image,
              attempt: retryCount + 1,
              element: e.currentTarget.outerHTML.substring(0, 100)
            };
            
            setLoadingErrors(prev => [...prev, errorInfo]);
            
            console.error('Ошибка загрузки изображения:', {
              ...errorInfo,
              isZylalabs: image.includes('zylalabs'),
              isProxied: image.includes('proxied=true')
            });
            
            if (retryCount < maxRetries) {
              retryImageLoad();
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      )}
      
      {isRetrying && !imageError && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 h-1 animate-pulse">
          <div 
            className="h-full bg-blue-700" 
            style={{width: `${(retryCount / maxRetries) * 100}%`}}
          ></div>
        </div>
      )}
    </div>
  );
}
