
import React from 'react';
import { ImageOff } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getPlaceholderImageUrl } from '@/services/imageService';
import { DetailedImageLoadingState } from './useDetailedImageLoading';

interface DetailedStandardImageProps {
  image: string;
  title: string | null;
  imageState: DetailedImageLoadingState;
  onClick: () => void;
}

export const DetailedStandardImage: React.FC<DetailedStandardImageProps> = ({
  image,
  title,
  imageState,
  onClick
}) => {
  const { imageLoading, imageError, handleImageLoad, handleImageError } = imageState;
  const placeholderUrl = title ? getPlaceholderImageUrl(title) : '';

  return (
    <div className="relative">
      {imageLoading && (
        <Skeleton className="w-full h-[200px] absolute inset-0" />
      )}
      
      <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={onClick}>
        <img 
          src={image} 
          alt={title || "Товар"} 
          className="max-h-[300px] object-contain"
          onError={(e) => {
            handleImageError();
            // Устанавливаем заглушку или скрываем изображение при ошибке
            if (placeholderUrl) {
              e.currentTarget.src = placeholderUrl;
            } else {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const container = target.parentElement;
              if (container) {
                const fallback = document.createElement('div');
                fallback.className = "flex flex-col items-center justify-center h-[200px]";
                fallback.innerHTML = `
                  <svg width="48" height="48" class="text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8.688C3 7.192 4.206 6 5.714 6h12.572C19.794 6 21 7.192 21 8.688v6.624C21 16.808 19.794 18 18.286 18H5.714C4.206 18 3 16.808 3 15.312V8.688z" stroke="currentColor" stroke-width="2"/>
                    <path d="M9.5 11.5l-2 2M21 6l-3.5 3.5M13.964 12.036l-2.036 2.036" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <p class="text-sm text-gray-500 mt-2">Изображение недоступно</p>
                `;
                container.appendChild(fallback);
              }
            }
          }}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={32} className="text-gray-500" />
            <p className="text-xs text-gray-600 mt-1">Ошибка загрузки</p>
          </div>
        </div>
      )}
    </div>
  );
};
