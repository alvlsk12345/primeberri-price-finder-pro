
import React, { useState, useEffect } from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLoadingState } from './useProductImageLoading';
import { ImageSourceInfo } from './ImageSourceDetector';
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { getProxiedImageUrl, needsProxying } from '@/services/image/imageProxy';
import { 
  isZylalabsImage, 
  isGoogleImage, 
  isGoogleThumbnail 
} from '@/services/image/imageSourceDetector';

interface AvatarProductImageProps {
  image: string;
  title: string;
  imageState: ImageLoadingState;
  sourceInfo: ImageSourceInfo;
  onClick: () => void;
}

export const AvatarProductImage: React.FC<AvatarProductImageProps> = ({
  image,
  title,
  imageState,
  sourceInfo,
  onClick
}) => {
  const { imageLoading, imageError, handleImageLoad, handleImageError } = imageState;
  const { isZylalabs, isGoogleImage: isGoogleImageType, isProxiedUrl } = sourceInfo;
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  
  const MAX_RETRIES = 3;
  
  // Подробное логирование для отладки загрузки изображения
  useEffect(() => {
    console.log(`Инициализация AvatarProductImage:`, {
      image: image.substring(0, 100) + (image.length > 100 ? '...' : ''),
      isZylalabs,
      isGoogleImageType,
      isProxiedUrl,
      isGoogleThumb: isGoogleThumbnail(image)
    });
  }, [image, isZylalabs, isGoogleImageType, isProxiedUrl]);
  
  // Функция для попытки использования прокси при CORS-ошибках
  const tryWithProxy = (originalUrl: string): string => {
    // Уже проксированные URL не проксируем повторно
    if (isProxiedUrl) {
      console.log(`URL уже проксирован, добавляем параметр обновления:`, originalUrl);
      return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    
    // Для Zylalabs изображений всегда используем directFetch=true
    const directFetch = isZylalabsImage(originalUrl) || isGoogleThumbnail(originalUrl);
    console.log(`Применяем прокси для изображения. DirectFetch=${directFetch}:`, originalUrl);
    
    return getProxiedImageUrl(originalUrl, directFetch);
  };
  
  // Пытаемся автоматически восстановиться после ошибки загрузки 
  useEffect(() => {
    if (imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой
      const delay = 800 * (retryCount + 1); // Увеличиваем задержку с каждой попыткой
      console.log(`Повторная попытка загрузки изображения ${retryCount + 1}/${MAX_RETRIES} через ${delay}мс:`, image);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        
        // Если это первая попытка и URL требует проксирования - используем прокси
        if (retryCount === 0 && needsProxying(image)) {
          const proxiedUrl = tryWithProxy(image);
          console.log(`Применяем прокси при первой ошибке:`, proxiedUrl);
          setFallbackImage(proxiedUrl);
        } else {
          // Добавляем уникальный параметр для обхода кэширования
          const refreshUrl = `${image}${image.includes('?') ? '&' : '?'}retry=${Date.now()}`;
          console.log(`Обновляем URL с параметром времени:`, refreshUrl);
          setFallbackImage(refreshUrl);
          
          // Для Zylalabs при второй попытке пробуем добавить directFetch=true
          if (retryCount === 1 && isZylalabs && !image.includes('directFetch=true')) {
            const zylalabsUrl = `${image}&directFetch=true`;
            console.log(`Вторая попытка для Zylalabs с directFetch=true:`, zylalabsUrl);
            setFallbackImage(zylalabsUrl);
          }
        }
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (imageError && retryCount >= MAX_RETRIES) {
      // Если исчерпаны все попытки, используем заглушку
      console.log(`Все ${MAX_RETRIES} попытки загрузки изображения исчерпаны, используем заглушку`);
      setFallbackImage(getPlaceholderImageUrl(title));
    }
  }, [imageError, retryCount, image, title, isZylalabs]);
  
  // Используем источник изображения с учетом повторных попыток
  const imageSrc = fallbackImage || image;

  return (
    <div 
      className="w-full h-[150px] mb-3 flex items-center justify-center relative cursor-pointer" 
      onClick={onClick}
    >
      {imageLoading && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      <Avatar className="w-full h-full rounded-none">
        <AvatarImage 
          src={imageSrc} 
          alt={title}
          className="object-contain"
          onError={(e) => {
            console.error(`Ошибка загрузки изображения (${retryCount}/${MAX_RETRIES}):`, {
              src: e.currentTarget.src.substring(0, 100) + '...',
              originalSrc: image.substring(0, 50) + '...',
              isRetry: retryCount > 0,
              isProxiedUrl,
              isGoogleImage: isGoogleImageType,
              isZylalabs,
              isGoogleThumb: isGoogleThumbnail(image),
              errorType: e.type
            });
            handleImageError();
          }}
          onLoad={(e) => {
            console.log(`Успешно загружено изображение:`, {
              src: e.currentTarget.src.substring(0, 50) + '...',
              isRetry: retryCount > 0,
              retryCount,
              isProxiedUrl,
              isGoogleImage: isGoogleImageType,
              isZylalabs
            });
            handleImageLoad();
          }}
          crossOrigin="anonymous"
        />
        <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={32} className="text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
          </div>
        </AvatarFallback>
      </Avatar>
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={24} className="text-gray-500" />
            <p className="text-xs text-gray-600 mt-1">
              Ошибка загрузки {isZylalabs ? "(Zylalabs)" : isGoogleImageType ? "(Google)" : "(API)"}
            </p>
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <p className="text-xs text-gray-600">Попытка {retryCount}/{MAX_RETRIES}...</p>
            )}
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
