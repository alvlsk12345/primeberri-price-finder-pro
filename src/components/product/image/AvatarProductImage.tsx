
import React from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLoadingState } from './useProductImageLoading';
import { ImageSourceInfo } from './ImageSourceDetector';

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
  const { isZylalabs, isGoogleImage } = sourceInfo;

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
          src={image} 
          alt={title}
          className="object-contain"
          onError={handleImageError}
          onLoad={handleImageLoad}
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
