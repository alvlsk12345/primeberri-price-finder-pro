
import React from 'react';
import { ImageOff } from "lucide-react";
import { ImageModalStandardImage } from './ImageModalStandardImage';
import { ImageModalAvatarImage } from './ImageModalAvatarImage';
import { ImageModalLoadingState } from './useImageModalLoading';
import { ImageModalSourceInfo } from './useImageModalSource';

interface ImageModalContentProps {
  displayedImage: string;
  productTitle: string | null;
  loadingState: ImageModalLoadingState;
  sourceInfo: ImageModalSourceInfo;
}

export const ImageModalContent: React.FC<ImageModalContentProps> = ({
  displayedImage,
  productTitle,
  loadingState,
  sourceInfo
}) => {
  const { imageError } = loadingState;
  const { useAvatar } = sourceInfo;

  return (
    <div className="flex justify-center items-center p-4">
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
      
      {/* Показываем сообщение об ошибке, если не удалось загрузить изображение */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={48} className="text-gray-500" />
            <p className="text-sm text-gray-600 mt-2">Ошибка загрузки изображения</p>
          </div>
        </div>
      )}
    </div>
  );
};
