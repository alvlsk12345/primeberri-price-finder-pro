
import React from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedImageLoadingState } from './useDetailedImageLoading';
import { DetailedImageSourceInfo } from './DetailedImageSourceDetector';

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
  const { isZylalabs, isGoogleImage } = sourceInfo;

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
          src={image}
          alt={title || "Товар"}
          className="object-contain"
          onError={handleImageError}
          onLoad={handleImageLoad}
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
          </div>
        </div>
      )}
    </div>
  );
};
