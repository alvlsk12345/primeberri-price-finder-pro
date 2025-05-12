
import React from 'react';
import { ImageModalLoadingState } from './useImageModalLoading';

interface ImageModalStandardImageProps {
  displayedImage: string;
  productTitle: string | null;
  loadingState: ImageModalLoadingState;
}

export const ImageModalStandardImage: React.FC<ImageModalStandardImageProps> = ({
  displayedImage,
  productTitle,
  loadingState
}) => {
  const { handleImageLoad, handleImageError } = loadingState;
  
  return (
    <img
      src={displayedImage}
      alt={productTitle || "Изображение товара"}
      className="max-w-full max-h-[70vh] object-contain"
      loading="lazy"
      onLoad={handleImageLoad}
      onError={handleImageError}
      crossOrigin="anonymous"
    />
  );
};
