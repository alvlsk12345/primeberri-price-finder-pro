
import React from 'react';
import { ImageModalLoadingState } from './useImageModalLoading';
import { ImageModalSourceInfo } from './useImageModalSource';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageModalAvatarImage } from './ImageModalAvatarImage';
import { ImageModalStandardImage } from './ImageModalStandardImage';

interface ImageModalContentProps {
  displayedImage: string;
  productTitle: string | null;
  loadingState: ImageModalLoadingState;
  sourceInfo: ImageModalSourceInfo;
  retryCount: number;
  maxRetries: number;
}

export const ImageModalContent: React.FC<ImageModalContentProps> = ({
  displayedImage,
  productTitle,
  loadingState,
  sourceInfo,
  retryCount,
  maxRetries
}) => {
  const { imageLoading, imageError } = loadingState;
  const { useAvatar, isZylalabs } = sourceInfo;
  
  // Показываем скелетон во время загрузки
  if (imageLoading) {
    return (
      <div className="flex items-center justify-center w-full">
        <Skeleton className="w-full aspect-square max-w-lg rounded-lg" />
      </div>
    );
  }
  
  // Если ошибка загрузки и достигнуто максимальное количество попыток
  if (imageError && retryCount >= maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Ошибка загрузки изображения</h3>
        <p className="text-sm text-gray-500 mt-2">
          {isZylalabs 
            ? 'Не удалось загрузить изображение из Zylalabs API. Возможно, оно недоступно или требует авторизации.' 
            : 'Не удалось загрузить изображение после нескольких попыток.'}
        </p>
      </div>
    );
  }
  
  // Отображаем изображение в зависимости от его типа
  return (
    <div className="flex items-center justify-center w-full">
      {useAvatar ? (
        <ImageModalAvatarImage 
          displayedImage={displayedImage} 
          productTitle={productTitle} 
          loadingState={loadingState}
        />
      ) : (
        <ImageModalStandardImage 
          displayedImage={displayedImage} 
          productTitle={productTitle} 
          loadingState={loadingState}
        />
      )}
    </div>
  );
};
