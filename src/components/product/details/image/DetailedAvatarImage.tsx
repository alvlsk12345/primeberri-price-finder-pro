
import React, { useState, useEffect } from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedImageLoadingState } from './useDetailedImageLoading';
import { DetailedImageSourceInfo } from './DetailedImageSourceDetector';
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { switchToNextProxy } from '@/services/image/corsProxyService';

interface DetailedAvatarImageProps {
  image: string;
  title: string | null;
  imageState: DetailedImageLoadingState;
  sourceInfo: DetailedImageSourceInfo;
  onClick: () => void;
}

export const DetailedAvatarImage: React.FC<DetailedAvatarImageProps> = ({
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

  // Пытаемся автоматически восстановиться после ошибки загрузки
  useEffect(() => {
    if (imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой
      const timer = setTimeout(() => {
        console.log(`Повторная попытка загрузки детального изображения ${retryCount + 1}/${MAX_RETRIES}: ${image}`);
        
        // Переключаемся на другой прокси если URL уже проксирован
        if (isProxiedUrl) {
          console.log(`Детальное изображение уже проксировано, переключаемся на следующий прокси`);
          switchToNextProxy();
        }
        
        setRetryCount(prev => prev + 1);
        // Форсируем ререндер изображения
        setFallbackImage(`${image}?retry=${Date.now()}`);
      }, 1000 * (retryCount + 1)); // Увеличиваем время ожидания с каждой попыткой
      
      return () => clearTimeout(timer);
    } else if (imageError && retryCount >= MAX_RETRIES) {
      // Если исчерпаны все попытки, используем заглушку
      console.log(`Все ${MAX_RETRIES} попытки загрузки детального изображения исчерпаны, используем заглушку`);
      setFallbackImage(title ? getPlaceholderImageUrl(title) : null);
    }
  }, [imageError, retryCount, image, title, isProxiedUrl]);
  
  // Используем источник изображения с учетом повторных попыток
  const imageSrc = fallbackImage || image;

  return (
    <div className="relative">
      {imageLoading && (
        <Skeleton className="w-full h-[200px] absolute inset-0" />
      )}
      
      <Avatar 
        className="w-full h-[200px] rounded-none cursor-pointer hover:opacity-90 transition-opacity" 
        onClick={onClick}
      >
        <AvatarImage 
          src={imageSrc}
          alt={title || "Товар"}
          className="object-contain"
          onError={(e) => {
            console.error(`Ошибка загрузки детального изображения (${retryCount}/${MAX_RETRIES}):`, {
              src: e.currentTarget.src,
              originalSrc: image,
              isRetry: retryCount > 0,
              isProxiedUrl,
              isGoogleImage,
              isZylalabs
            });
            handleImageError();
          }}
          onLoad={(e) => {
            console.log(`Успешно загружено детальное изображение:`, {
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
            <ImageOff size={48} className="text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
          </div>
        </AvatarFallback>
      </Avatar>
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={32} className="text-gray-500" />
            <p className="text-xs text-gray-600 mt-1">Ошибка загрузки</p>
            <p className="text-xs text-gray-600">{isZylalabs ? "(Zylalabs API)" : isGoogleImage ? "(Google API)" : "(API изображение)"}</p>
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <p className="text-xs text-gray-600">Попытка {retryCount}/{MAX_RETRIES}...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
