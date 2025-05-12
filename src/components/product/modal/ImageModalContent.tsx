
import React from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { ImageModalSourceInfo } from './useImageModalSource';
import { isGoogleThumbnail, isZylalabsImage } from '@/services/image/imageSourceDetector';

interface ImageModalContentProps {
  displayedImage: string;
  productTitle: string;
  loadingState: {
    imageLoading: boolean;
    imageError: boolean;
    handleImageLoad: () => void;
    handleImageError: () => void;
  };
  sourceInfo: ImageModalSourceInfo;
  retryCount?: number;
  maxRetries?: number;
}

export const ImageModalContent: React.FC<ImageModalContentProps> = ({
  displayedImage,
  productTitle,
  loadingState,
  sourceInfo,
  retryCount = 0,
  maxRetries = 2
}) => {
  const { imageLoading, imageError, handleImageLoad, handleImageError } = loadingState;
  const { useAvatar, isGoogleImage, isZylalabs, isProxiedUrl } = sourceInfo;
  const placeholderImage = getPlaceholderImageUrl(productTitle);
  
  // Определяем, является ли изображение миниатюрой Google
  const isGoogleThumb = isGoogleThumbnail(displayedImage);
  
  // Более точно определяем, является ли изображение от Zylalabs
  const isZylalabsImgSrc = isZylalabsImage(displayedImage);
  
  // Подробное логирование для отладки
  React.useEffect(() => {
    console.log('Отрисовка контента модального окна:', {
      useAvatar,
      imageLoading,
      imageError,
      retryCount,
      isProxiedUrl,
      isGoogleThumb,
      isZylalabsImgSrc,
      imageUrl: displayedImage.substring(0, 100) + (displayedImage.length > 100 ? '...' : '')
    });
  }, [useAvatar, imageLoading, imageError, retryCount, isProxiedUrl, displayedImage]);
  
  // Если нужно использовать Avatar компонент (для Google, Zylalabs и прочих проксированных URL)
  if (useAvatar || isGoogleThumb || isZylalabsImgSrc) {
    return (
      <div className="w-full relative">
        {imageLoading && (
          <Skeleton className="w-full h-[400px] absolute inset-0" />
        )}
        
        <Avatar className="w-full h-[400px] rounded">
          <AvatarImage 
            src={displayedImage} 
            alt={productTitle}
            className="object-contain"
            onError={(e) => {
              console.error('Ошибка загрузки изображения в модальном окне:', {
                src: e.currentTarget.src.substring(0, 100) + '...',
                isRetry: retryCount > 0,
                isGoogleThumb,
                isZylalabsImgSrc
              });
              handleImageError();
            }}
            onLoad={(e) => {
              console.log('Изображение в модальном окне успешно загружено:', {
                src: e.currentTarget.src.substring(0, 50) + '...',
                isRetry: retryCount > 0
              });
              handleImageLoad();
            }}
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <ImageOff size={48} className="text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
            </div>
          </AvatarFallback>
        </Avatar>
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
            <div className="flex flex-col items-center justify-center">
              <ImageOff size={36} className="text-gray-500" />
              <p className="text-sm text-gray-600 mt-1">Ошибка загрузки изображения</p>
              <p className="text-xs text-gray-600">
                {isZylalabsImgSrc ? "Zylalabs API" : 
                isGoogleThumb ? "Google Thumbnail" :
                isGoogleImage ? "Google API" : 
                isProxiedUrl ? "Проксированный URL" : "Внешний источник"}
              </p>
              {retryCount > 0 && retryCount < maxRetries && (
                <p className="text-xs text-gray-600">Попытка {retryCount}/{maxRetries}...</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Для обычных изображений без CORS проблем используем стандартный img тег
  return (
    <div className="w-full relative">
      {imageLoading && (
        <Skeleton className="w-full h-[400px] absolute inset-0" />
      )}
      
      <img
        src={imageError ? placeholderImage : displayedImage}
        alt={productTitle}
        className="w-full max-h-[400px] object-contain"
        onError={(e) => {
          console.error('Ошибка загрузки стандартного изображения в модальном окне:', displayedImage.substring(0, 100) + '...');
          e.currentTarget.onerror = null; // Предотвращаем бесконечную рекурсию
          handleImageError();
        }}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={36} className="text-gray-500" />
            <p className="text-sm text-gray-600 mt-1">Ошибка загрузки изображения</p>
            {retryCount > 0 && retryCount < maxRetries && (
              <p className="text-xs text-gray-600">Попытка {retryCount}/{maxRetries}...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
