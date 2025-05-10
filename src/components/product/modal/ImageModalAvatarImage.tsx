
import React from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageModalLoadingState } from './useImageModalLoading';

interface ImageModalAvatarImageProps {
  displayedImage: string;
  productTitle: string | null;
  loadingState: ImageModalLoadingState;
}

export const ImageModalAvatarImage: React.FC<ImageModalAvatarImageProps> = ({
  displayedImage,
  productTitle,
  loadingState
}) => {
  const { handleImageLoad, handleImageError } = loadingState;
  
  return (
    <Avatar className="w-full h-[70vh] rounded-none">
      <AvatarImage
        src={displayedImage}
        alt={productTitle || "Изображение товара"}
        className="object-contain max-h-[70vh] max-w-full"
        onError={handleImageError}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      <AvatarFallback className="w-full h-full rounded-none bg-gray-100 flex flex-col items-center justify-center">
        <ImageOff size={48} className="text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
      </AvatarFallback>
    </Avatar>
  );
};
