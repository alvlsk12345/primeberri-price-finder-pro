
import React, { useState, useEffect } from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLoadingState } from './useProductImageLoading';
import { ImageSourceInfo } from './ImageSourceDetector';
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { getProxiedImageUrl, needsProxying } from '@/services/image/imageProxy';

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
  const { isZylalabs, isGoogleImage, isProxiedUrl } = sourceInfo;
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  
  const MAX_RETRIES = 3;
  
  // Функция для попытки использования прокси при CORS-ошибках
  const tryWithProxy = (originalUrl: string) => {
    // Если URL уже проксирован или не требует проксирования, используем другую стратегию
    if (isProxiedUrl || !needsProxying(originalUrl)) {
      return `${originalUrl}?retry=${Date.now()}`;
    }
    
    // Применяем прокси
    console.log(`Попытка проксирования изображения для обхода CORS: ${originalUrl}`);
    return getProxiedImageUrl(originalUrl);
  };
  
  // Пытаемся автоматически восстановиться после ошибки загрузки 
  useEffect(() => {
    if (imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой
      const timer = setTimeout(() => {
        console.log(`Повторная попытка загрузки изображения ${retryCount + 1}/${MAX_RETRIES}: ${image}`);
        
        setRetryCount(prev => prev + 1);
        
        // Если это первая попытка и URL требует проксирования - используем прокси
        if (retryCount === 0 && needsProxying(image)) {
          setFallbackImage(tryWithProxy(image));
        } else {
          // Иначе просто форсируем ререндер изображения с новым timestamp
          setFallbackImage(`${image}?retry=${Date.now()}`);
        }
      }, 1000 * (retryCount + 1)); // Увеличиваем время ожидания с каждой попыткой
      
      return () => clearTimeout(timer);
    } else if (imageError && retryCount >= MAX_RETRIES) {
      // Если исчерпаны все попытки, используем заглушку
      console.log(`Все ${MAX_RETRIES} попытки загрузки изображения исчерпаны, используем заглушку`);
      setFallbackImage(getPlaceholderImageUrl(title));
    }
  }, [imageError, retryCount, image, title]);
  
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
              src: e.currentTarget.src,
              originalSrc: image,
              isRetry: retryCount > 0,
              isProxiedUrl,
              isGoogleImage,
              isZylalabs,
              errorType: e.type,
              corsError: e.currentTarget.src.includes('encrypted-tbn')
            });
            handleImageError();
          }}
          onLoad={(e) => {
            console.log(`Успешно загружено изображение:`, {
              src: e.currentTarget.src,
              isRetry: retryCount > 0,
              isProxiedUrl,
              isGoogleImage,
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
              Ошибка загрузки {isZylalabs ? "(Zylalabs)" : isGoogleImage ? "(Google)" : "(API)"}
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
